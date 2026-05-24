from datetime import datetime, timezone as dt_timezone

import stripe
from django.conf import settings
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Subscription, User

from .models import BillingEvent
from .serializers import CheckoutSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_LIMITS = {"free": 500, "starter": 5000, "pro": 15000, "business": 50000}


def period_end_datetime(subscription):
    value = subscription.get("current_period_end")
    return datetime.fromtimestamp(value, tz=dt_timezone.utc) if value else None


def update_user_plan(user, plan):
    user.plan = plan
    user.words_limit = PLAN_LIMITS.get(plan, 500)
    user.save(update_fields=["plan", "words_limit"])


class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.validated_data["plan"]
        price_id = settings.STRIPE_PRICE_IDS.get(plan)
        if not price_id:
            return Response({"detail": "Stripe price is not configured."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(email=user.email, name=user.full_name or user.email)
            user.stripe_customer_id = customer.id
            user.save(update_fields=["stripe_customer_id"])

        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{settings.FRONTEND_URL}/dashboard?upgraded=true",
            cancel_url=f"{settings.FRONTEND_URL}/pricing",
            metadata={"user_id": str(user.id), "plan": plan},
            subscription_data={"metadata": {"user_id": str(user.id), "plan": plan}},
        )
        return Response({"checkout_url": session.url})


class CustomerPortalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.stripe_customer_id:
            return Response({"detail": "No Stripe customer exists."}, status=status.HTTP_400_BAD_REQUEST)
        session = stripe.billing_portal.Session.create(
            customer=request.user.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/settings",
        )
        return Response({"portal_url": session.url})


class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        signature = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(payload, signature, settings.STRIPE_WEBHOOK_SECRET)
        except Exception:
            return HttpResponse(status=200)

        if BillingEvent.objects.filter(stripe_event_id=event["id"]).exists():
            return HttpResponse(status=200)
        BillingEvent.objects.create(stripe_event_id=event["id"], event_type=event["type"])

        try:
            event_type = event["type"]
            data = event["data"]["object"]
            if event_type == "checkout.session.completed":
                self.handle_checkout_completed(data)
            elif event_type == "customer.subscription.updated":
                self.handle_subscription_updated(data)
            elif event_type == "customer.subscription.deleted":
                self.handle_subscription_deleted(data)
            elif event_type == "invoice.payment_failed":
                self.handle_payment_failed(data)
        except Exception:
            return HttpResponse(status=200)
        return HttpResponse(status=200)

    def handle_checkout_completed(self, session):
        user = User.objects.get(id=session["metadata"]["user_id"])
        plan = session["metadata"]["plan"]
        subscription = stripe.Subscription.retrieve(session["subscription"])
        update_user_plan(user, plan)
        Subscription.objects.update_or_create(
            user=user,
            defaults={
                "stripe_subscription_id": subscription.id,
                "plan": plan,
                "status": subscription.status,
                "current_period_end": period_end_datetime(subscription),
                "cancel_at_period_end": subscription.cancel_at_period_end,
            },
        )

    def handle_subscription_updated(self, subscription):
        record = Subscription.objects.filter(stripe_subscription_id=subscription["id"]).select_related("user").first()
        if not record:
            return
        plan = subscription.get("metadata", {}).get("plan", record.plan)
        record.plan = plan
        record.status = subscription["status"]
        record.current_period_end = period_end_datetime(subscription)
        record.cancel_at_period_end = subscription.get("cancel_at_period_end", False)
        record.save(update_fields=["plan", "status", "current_period_end", "cancel_at_period_end"])
        update_user_plan(record.user, plan)

    def handle_subscription_deleted(self, subscription):
        record = Subscription.objects.filter(stripe_subscription_id=subscription["id"]).select_related("user").first()
        if not record:
            return
        record.status = Subscription.STATUS_CANCELED
        record.save(update_fields=["status"])
        update_user_plan(record.user, User.PLAN_FREE)

    def handle_payment_failed(self, invoice):
        subscription_id = invoice.get("subscription")
        if subscription_id:
            Subscription.objects.filter(stripe_subscription_id=subscription_id).update(status=Subscription.STATUS_PAST_DUE)


class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subscription = getattr(request.user, "subscription", None)
        return Response(
            {
                "plan": request.user.plan,
                "words_used": request.user.words_used_this_month,
                "words_limit": request.user.words_limit,
                "words_remaining": request.user.words_remaining,
                "subscription_status": subscription.status if subscription else "free",
                "period_end": subscription.current_period_end if subscription else None,
            }
        )

