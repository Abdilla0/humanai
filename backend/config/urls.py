from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/humanize/", include("apps.humanizer.urls")),
    path("api/billing/", include("apps.billing.urls")),
    path("social/", include("social_django.urls", namespace="social")),
]

