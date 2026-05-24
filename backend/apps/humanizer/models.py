from django.conf import settings
from django.db import models


class HumanizerJob(models.Model):
    MODE_STANDARD = "standard"
    MODE_CASUAL = "casual"
    MODE_ACADEMIC = "academic"
    MODE_AGGRESSIVE = "aggressive"
    MODE_CHOICES = (
        (MODE_STANDARD, "Standard"),
        (MODE_CASUAL, "Casual"),
        (MODE_ACADEMIC, "Academic"),
        (MODE_AGGRESSIVE, "Aggressive"),
    )

    STATUS_PENDING = "pending"
    STATUS_PROCESSING = "processing"
    STATUS_DONE = "done"
    STATUS_FAILED = "failed"
    STATUS_CHOICES = (
        (STATUS_PENDING, "Pending"),
        (STATUS_PROCESSING, "Processing"),
        (STATUS_DONE, "Done"),
        (STATUS_FAILED, "Failed"),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="humanizer_jobs")
    original_text = models.TextField()
    humanized_text = models.TextField(blank=True)
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default=MODE_STANDARD)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    error_message = models.TextField(blank=True)
    word_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

