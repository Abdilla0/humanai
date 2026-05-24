from rest_framework import serializers


class CheckoutSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=("starter", "pro", "business"))

