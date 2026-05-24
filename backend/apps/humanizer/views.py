import re

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import UsageLog, User
from utils.file_parser import parse_file

from .models import HumanizerJob
from .serializers import HumanizerHistorySerializer, HumanizerJobSerializer
from .tasks import humanize_task

PLAN_MODES = {
    User.PLAN_FREE: [HumanizerJob.MODE_STANDARD],
    User.PLAN_STARTER: [HumanizerJob.MODE_STANDARD, HumanizerJob.MODE_CASUAL],
    User.PLAN_PRO: [HumanizerJob.MODE_STANDARD, HumanizerJob.MODE_CASUAL, HumanizerJob.MODE_ACADEMIC, HumanizerJob.MODE_AGGRESSIVE],
    User.PLAN_BUSINESS: [HumanizerJob.MODE_STANDARD, HumanizerJob.MODE_CASUAL, HumanizerJob.MODE_ACADEMIC, HumanizerJob.MODE_AGGRESSIVE],
}


def count_words(text):
    return len(re.findall(r"\b[\w'-]+\b", text))


class HumanizeView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        plan = user.plan if user else User.PLAN_FREE
        mode = request.data.get("mode", HumanizerJob.MODE_STANDARD)
        uploaded_file = request.FILES.get("file")

        if uploaded_file:
            if not user or plan == User.PLAN_FREE:
                return Response({"detail": "File upload requires Pro or Business.", "code": "upgrade_required"}, status=status.HTTP_403_FORBIDDEN)
            try:
                text = parse_file(uploaded_file)
            except ValueError as exc:
                return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            text = request.data.get("text", "")

        text = (text or "").strip()
        if not text:
            return Response({"detail": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)
        if mode not in PLAN_MODES.get(plan, []):
            return Response({"detail": "Upgrade required for this mode.", "code": "upgrade_required"}, status=status.HTTP_403_FORBIDDEN)

        word_count = count_words(text)
        if user and user.words_remaining < word_count:
            return Response({"detail": "Not enough words remaining.", "code": "insufficient_words"}, status=status.HTTP_402_PAYMENT_REQUIRED)
        if not user and word_count > 500:
            return Response({"detail": "Anonymous use is limited to 500 words.", "code": "insufficient_words"}, status=status.HTTP_402_PAYMENT_REQUIRED)

        job = HumanizerJob.objects.create(user=user, original_text=text, mode=mode, word_count=word_count)
        if user:
            user.words_used_this_month += word_count
            user.save(update_fields=["words_used_this_month"])
            UsageLog.objects.create(user=user, word_count=word_count, mode=mode)
        humanize_task.delay(job.id)
        return Response({"job_id": job.id, "status": job.status, "word_count": word_count}, status=status.HTTP_201_CREATED)


class HumanizeJobView(generics.RetrieveAPIView):
    serializer_class = HumanizerJobSerializer
    queryset = HumanizerJob.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return self.queryset.filter(user=self.request.user)
        return self.queryset.filter(user__isnull=True)


class HumanizeHistoryView(generics.ListAPIView):
    serializer_class = HumanizerHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return HumanizerJob.objects.filter(user=self.request.user).order_by("-created_at")

