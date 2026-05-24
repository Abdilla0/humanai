from django.db import models


class BillingEvent(models.Model):
    stripe_event_id = models.CharField(max_length=120, unique=True)
    event_type = models.CharField(max_length=120)
    processed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-processed_at"]

