import requests
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.db import IntegrityError
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as SimpleJwtTokenRefreshView

from .models import User
from .serializers import UserSerializer


def build_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def auth_payload(user):
    return {"user": UserSerializer(user).data, "tokens": build_tokens(user)}


def validation_error(detail, field=None):
    errors = {field: [detail]} if field else {"non_field_errors": [detail]}
    return Response({"detail": detail, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)


def send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}"
    subject = "Confirm your HumanAI email"
    message = (
        f"Hi {user.full_name or 'there'},\n\n"
        "Welcome to HumanAI. Confirm your email address to activate your account:\n\n"
        f"{verify_url}\n\n"
        "If you did not create this account, you can ignore this email."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        full_name = request.data.get("full_name", "").strip()

        if not email:
            return validation_error("Email is required.", "email")
        try:
            validate_email(email)
        except ValidationError:
            return validation_error("Enter a valid email address.", "email")
        if User.objects.filter(email=email).exists():
            existing_user = User.objects.get(email=email)
            if not existing_user.email_verified:
                try:
                    send_verification_email(existing_user)
                except Exception:
                    return Response(
                        {
                            "detail": "Account exists, but the verification email could not be sent. Check email settings.",
                            "errors": {"email": ["Verification email could not be sent."]},
                        },
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
                return Response(
                    {
                        "detail": "This email is already registered but not verified. We sent a new confirmation email.",
                        "requires_verification": True,
                        "email": existing_user.email,
                    },
                    status=status.HTTP_200_OK,
                )
            return validation_error("An account with this email already exists.", "email")
        if len(password) < 8:
            return validation_error("Password must be at least 8 characters.", "password")

        try:
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=full_name,
                plan=User.PLAN_FREE,
                words_limit=500,
                is_active=False,
                email_verified=False,
            )
        except IntegrityError:
            return validation_error("An account with this email already exists.", "email")
        try:
            send_verification_email(user)
        except Exception:
            user.delete()
            return Response(
                {
                    "detail": "Account could not be created because the verification email could not be sent. Check email settings.",
                    "errors": {"email": ["Verification email could not be sent."]},
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(
            {
                "detail": "Account created. Please check your email to confirm your account.",
                "requires_verification": True,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        if not email:
            return validation_error("Email is required.", "email")
        if not password:
            return validation_error("Password is required.", "password")
        user = authenticate(request, email=email, password=password)
        if not user:
            inactive_user = User.objects.filter(email=email, is_active=False, email_verified=False).first()
            if inactive_user and inactive_user.check_password(password):
                return Response(
                    {
                        "detail": "Please confirm your email before signing in.",
                        "errors": {"email": ["Email confirmation is required."]},
                        "requires_verification": True,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            return Response(
                {"detail": "Invalid email or password.", "errors": {"non_field_errors": ["Invalid email or password."]}},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response(auth_payload(user))


class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token", "")
        if not access_token:
            return validation_error("Google access token is required.", "access_token")

        try:
            resp = requests.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"access_token": access_token},
                timeout=15,
            )
            if resp.status_code != 200:
                resp = requests.get(
                    "https://oauth2.googleapis.com/tokeninfo",
                    params={"id_token": access_token},
                    timeout=15,
                )
        except requests.RequestException:
            return Response(
                {"detail": "Could not verify Google sign in right now.", "errors": {"google": ["Google verification failed."]}},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if resp.status_code != 200:
            return Response(
                {"detail": "Invalid Google token.", "errors": {"google": ["Invalid Google token."]}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        profile = resp.json()
        email = profile.get("email", "").lower()
        if not email:
            return validation_error("Google account did not return an email.", "email")

        user, is_new = User.objects.get_or_create(
            email=email,
            defaults={
                "username": "",
                "full_name": profile.get("name", ""),
                "avatar_url": profile.get("picture", ""),
                "google_uid": profile.get("sub", ""),
                "plan": User.PLAN_FREE,
                "words_limit": 500,
                "email_verified": True,
                "is_active": True,
            },
        )
        changed = False
        for field, value in {
            "avatar_url": profile.get("picture", ""),
            "google_uid": profile.get("sub", ""),
            "full_name": profile.get("name", user.full_name),
            "email_verified": True,
            "is_active": True,
        }.items():
            if value is not None and getattr(user, field) != value:
                setattr(user, field, value)
                changed = True
        if changed:
            user.save(update_fields=["avatar_url", "google_uid", "full_name", "email_verified", "is_active"])

        payload = auth_payload(user)
        payload["is_new"] = is_new
        return Response(payload)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid", "")
        token = request.data.get("token", "")
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
        except Exception:
            return validation_error("Invalid verification link.")

        if not default_token_generator.check_token(user, token):
            return validation_error("This verification link is invalid or expired.")

        user.email_verified = True
        user.is_active = True
        user.save(update_fields=["email_verified", "is_active"])
        return Response({"detail": "Email confirmed. You can now sign in."})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_200_OK)


class TokenRefreshView(SimpleJwtTokenRefreshView):
    permission_classes = [permissions.AllowAny]


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        full_name = request.data.get("full_name", "").strip()
        request.user.full_name = full_name
        request.user.save(update_fields=["full_name"])
        return Response(UserSerializer(request.user).data)

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old_password = request.data.get("old_password", "")
        new_password = request.data.get("new_password", "")
        if not request.user.check_password(old_password):
            return validation_error("Old password is incorrect.", "old_password")
        if len(new_password) < 8:
            return validation_error("New password must be at least 8 characters.", "new_password")
        request.user.set_password(new_password)
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password changed successfully."})
