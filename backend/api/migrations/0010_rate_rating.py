# Generated by Django 5.1.2 on 2024-11-05 19:14

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0009_rate"),
    ]

    operations = [
        migrations.AddField(
            model_name="rate",
            name="rating",
            field=models.FloatField(default=0, validators=[api.models.validate_rating]),
            preserve_default=False,
        ),
    ]