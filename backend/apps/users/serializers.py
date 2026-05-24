from rest_framework import serializers

from .models import Subscription, User


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ("plan", "status", "current_period_end", "cancel_at_period_end")


class UserSerializer(serializers.ModelSerializer):
    words_remaining = serializers.IntegerField(read_only=True)
    subscription = SubscriptionSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "avatar_url",
            "email_verified",
            "plan",
            "words_used_this_month",
            "words_limit",
            "words_remaining",
            "billing_cycle_start",
            "subscription",
        )
        read_only_fields = (
            "id",
            "email",
            "avatar_url",
            "email_verified",
            "plan",
            "words_used_this_month",
            "words_limit",
            "words_remaining",
            "billing_cycle_start",
            "subscription",
        )
