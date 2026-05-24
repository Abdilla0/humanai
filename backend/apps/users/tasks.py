from celery import shared_task
from django.utils import timezone

from .models import User


@shared_task
def reset_monthly_credits():
    today = timezone.localdate()
    return User.objects.update(words_used_this_month=0, billing_cycle_start=today)

