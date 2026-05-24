from rest_framework import serializers

from .models import HumanizerJob


class HumanizerJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = HumanizerJob
        fields = (
            "id",
            "original_text",
            "humanized_text",
            "mode",
            "status",
            "error_message",
            "word_count",
            "created_at",
            "completed_at",
        )


class HumanizerHistorySerializer(serializers.ModelSerializer):
    preview = serializers.SerializerMethodField()

    class Meta:
        model = HumanizerJob
        fields = ("id", "mode", "word_count", "status", "created_at", "humanized_text", "preview")

    def get_preview(self, obj):
        return obj.humanized_text[:150]

