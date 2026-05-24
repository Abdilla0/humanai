from django.urls import path

from .views import (
    ChangePasswordView,
    GoogleAuthView,
    LoginView,
    LogoutView,
    RegisterView,
    TokenRefreshView,
    UserProfileView,
    VerifyEmailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleAuthView.as_view(), name="google-auth"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
