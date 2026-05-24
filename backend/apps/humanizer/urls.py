from django.urls import path

from .views import HumanizeHistoryView, HumanizeJobView, HumanizeView

urlpatterns = [
    path("", HumanizeView.as_view(), name="humanize"),
    path("<int:pk>/", HumanizeJobView.as_view(), name="humanize-job"),
    path("history/", HumanizeHistoryView.as_view(), name="humanize-history"),
]

