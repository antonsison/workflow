# Generated by Django 2.1.4 on 2019-01-08 02:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0004_auto_20190102_2259'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='channel_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='project',
            name='channel_name',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]