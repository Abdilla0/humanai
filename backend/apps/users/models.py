from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class EmailUserManager(UserManager):
    def _create_user_object(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        username = extra_fields.pop("username", "")
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        return user

    def _create_user(self, email, password, **extra_fields):
        user = self._create_user_object(email, password, **extra_fields)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    PLAN_FREE = "free"
    PLAN_STARTER = "starter"
    PLAN_PRO = "pro"
    PLAN_BUSINESS = "business"
    PLAN_CHOICES = (
        (PLAN_FREE, "Free"),
        (PLAN_STARTER, "Starter"),
        (PLAN_PRO, "Pro"),
        (PLAN_BUSINESS, "Business"),
    )

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, blank=True)
    full_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(blank=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default=PLAN_FREE)
    words_used_this_month = models.PositiveIntegerField(default=0)
    words_limit = models.PositiveIntegerField(default=500)
    billing_cycle_start = models.DateField(null=True, blank=True)
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    google_uid = models.CharField(max_length=200, blank=True)
    email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = EmailUserManager()

    @property
    def words_remaining(self):
        return max(0, self.words_limit - self.words_used_this_month)

    def __str__(self):
        return self.email


class Subscription(models.Model):
    STATUS_ACTIVE = "active"
    STATUS_CANCELED = "canceled"
    STATUS_PAST_DUE = "past_due"
    STATUS_TRIALING = "trialing"
    STATUS_CHOICES = (
        (STATUS_ACTIVE, "Active"),
        (STATUS_CANCELED, "Canceled"),
        (STATUS_PAST_DUE, "Past Due"),
        (STATUS_TRIALING, "Trialing"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="subscription")
    stripe_subscription_id = models.CharField(max_length=100)
    plan = models.CharField(max_length=20, choices=User.PLAN_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    current_period_end = models.DateTimeField(null=True)
    cancel_at_period_end = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} {self.plan} {self.status}"


class UsageLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="usage_logs")
    word_count = models.PositiveIntegerField()
    mode = models.CharField(max_length=30)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
