from datetime import datetime, timedelta
from django.conf import settings

from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination

from .models import Project

from users.models import User
from users.serializers import ShortUserSerializer
from history.models import Standup

from utils.mixins import TZ

class ProjectSerializer(serializers.ModelSerializer, TZ):
    """ project serializer
    """
    total_hours = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()
    weekly_hours = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id',
            'name',
            'description',
            'channel_name',
            'date_created',
            'date_updated',
            'total_hours',
            'users',
            'weekly_hours'
        )
    
    def get_total_hours(self, obj):
        stand_up = Standup.objects.filter(project=obj)
        total = sum([hours.total_hours for hours in stand_up])
        
        return total
    
    def get_users(self, obj):
        stand_up = Standup.objects.filter(project=obj)

        test_list = []
        for stand in stand_up:
            if stand.user not in test_list:
                test_list.append(stand.user)
        serializer = ShortUserSerializer(test_list, many=True)
        return serializer.data

    def get_weekly_hours(self, obj):
        today = datetime.strptime(datetime.today().__str__(), "%Y-%m-%d %H:%M:%S.%f").date()
        start, end = self.dt_range(today.__str__())
        stand_up = Standup.objects.filter(project=obj, date_created__range=[start, end])
        total = sum([hours.total_hours for hours in stand_up])
        return total