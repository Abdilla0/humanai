import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("config")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.beat_schedule = {
    "reset-monthly-credits": {
        "task": "apps.users.tasks.reset_monthly_credits",
        "schedule": crontab(minute=0, hour=0, day_of_month=1),
    }
}

