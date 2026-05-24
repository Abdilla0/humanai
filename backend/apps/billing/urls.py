from django.urls import path

from .views import CreateCheckoutSessionView, CustomerPortalView, StripeWebhookView, SubscriptionStatusView

urlpatterns = [
    path("checkout/", CreateCheckoutSessionView.as_view(), name="billing-checkout"),
    path("portal/", CustomerPortalView.as_view(), name="billing-portal"),
    path("webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
    path("status/", SubscriptionStatusView.as_view(), name="billing-status"),
]

