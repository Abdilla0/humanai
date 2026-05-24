import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("username", models.CharField(blank=True, max_length=150, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()])),
                ("full_name", models.CharField(blank=True, max_length=150)),
                ("avatar_url", models.URLField(blank=True)),
                ("plan", models.CharField(choices=[("free", "Free"), ("starter", "Starter"), ("pro", "Pro"), ("business", "Business")], default="free", max_length=20)),
                ("words_used_this_month", models.PositiveIntegerField(default=0)),
                ("words_limit", models.PositiveIntegerField(default=500)),
                ("billing_cycle_start", models.DateField(blank=True, null=True)),
                ("stripe_customer_id", models.CharField(blank=True, max_length=100)),
                ("google_uid", models.CharField(blank=True, max_length=200)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={
                "verbose_name": "user",
                "verbose_name_plural": "users",
                "abstract": False,
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="Subscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("stripe_subscription_id", models.CharField(max_length=100)),
                ("plan", models.CharField(choices=[("free", "Free"), ("starter", "Starter"), ("pro", "Pro"), ("business", "Business")], max_length=20)),
                ("status", models.CharField(choices=[("active", "Active"), ("canceled", "Canceled"), ("past_due", "Past Due"), ("trialing", "Trialing")], max_length=20)),
                ("current_period_end", models.DateTimeField(null=True)),
                ("cancel_at_period_end", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="subscription", to="users.user")),
            ],
        ),
        migrations.CreateModel(
            name="UsageLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("word_count", models.PositiveIntegerField()),
                ("mode", models.CharField(max_length=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="usage_logs", to="users.user")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

