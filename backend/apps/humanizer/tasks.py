from celery import shared_task
from django.utils import timezone

from utils.aihumanize_client import humanize_text

from .models import HumanizerJob


@shared_task(bind=True, max_retries=3)
def humanize_task(self, job_id):
    job = HumanizerJob.objects.get(id=job_id)
    try:
        job.status = HumanizerJob.STATUS_PROCESSING
        job.error_message = ""
        job.save(update_fields=["status", "error_message"])
        result = humanize_text(job.original_text, job.mode)
        job.humanized_text = result
        job.status = HumanizerJob.STATUS_DONE
        job.completed_at = timezone.now()
        job.save(update_fields=["humanized_text", "status", "completed_at"])
        return job.id
    except Exception as exc:
        job.status = HumanizerJob.STATUS_FAILED
        job.error_message = str(exc)
        job.save(update_fields=["status", "error_message"])
        raise self.retry(exc=exc, countdown=10)

