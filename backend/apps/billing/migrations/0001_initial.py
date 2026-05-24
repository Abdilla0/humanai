from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="BillingEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("stripe_event_id", models.CharField(max_length=120, unique=True)),
                ("event_type", models.CharField(max_length=120)),
                ("processed_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-processed_at"]},
        ),
    ]

