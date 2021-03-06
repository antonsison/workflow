from datetime import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from utils.mixins import Query
from users.serializers import ShortUserSerializer
from users.models import User
from accounting.serializers import ProjectSerializer
from history.serializers import BlockerSerializer

from .models import Event
from .mixins import FeedParser


class FeedSerializer(FeedParser, serializers.Serializer):
    """ feed serializer
    """
    instance = serializers.SerializerMethodField()
    instance_type = serializers.SerializerMethodField()

    def get_instance(self, obj):
        return self.serialize(obj)

    def get_instance_type(self, obj):
        return obj._meta.model_name


class EventSerializer(serializers.ModelSerializer):
    organizer = ShortUserSerializer(read_only=True)
    participants = ShortUserSerializer(read_only=True, many=True)
    participants_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='participants',
        write_only=True, many=True, required=False
    )
    frequency = serializers.CharField(required=False, allow_blank=True)


    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'content',
            'organizer',
            'participants',
            'participants_id',
            'frequency',
            'freq_min',
            'freq_hr',
            'freq_day',
            'freq_mo',
            'freq_week_idx',
            'event_date',
            'start_time',
            'end_time',
            'date_created',
        )
        read_only_fields = ('freq_min', 'freq_hr', 'freq_day', 'freq_mo', 'freq_week_idx',)

    def create(self, validated_data):
        frequency = self.initial_data.get('frequency')
        event = super(EventSerializer, self).create(validated_data)

        # Add event organizer as always participant.
        event.participants.add(event.organizer)
        if frequency:
            event.frequency = frequency

        return event

    def update(self, instance, validated_data):
        frequency = self.initial_data.get('frequency')
        event = super(EventSerializer, self).update(instance, validated_data)

        # Add event organizer as always participant.
        event.participants.add(event.organizer)
        if frequency:
            event.frequency = frequency

        return event

    def to_representation(self, instance):
        ret = super(EventSerializer, self).to_representation(instance)

        
        ret.update({
            # We need to allow read-write for start_time and end_time.
            # `SerializerMethodField` is not an option so we format these
            # fields here.
            'start_time': f"{instance.event_date}T{instance.start_time}",
            'end_time': f"{instance.event_date}T{instance.end_time}",
        })
        return ret


class PendingIssueSerializer(Query, serializers.Serializer):

    project = serializers.SerializerMethodField()
    blockers = serializers.SerializerMethodField()
    count = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        return super(PendingIssueSerializer, self).__init__(*args, **kwargs)

    def __serialize(self, s):
        """ shorthand hack to well :-/ shortened the things.
        """
        return (s, s.Meta.model)

    def get_project(self, instance):
        # extract the model and serializer class
        # using this method. actually it doesn't improve
        # anything other than making it more readable
        serializer, model = self.__serialize(ProjectSerializer)

        return serializer(self._get(model, id=instance.project_id)).data

    def get_blockers(self, instance):
        # extract the model and serializer class
        # using this method. actually it doesn't improve
        # anything other than making it more readable
        serializer, model = self.__serialize(BlockerSerializer)

        return serializer(
            self._filter(model, id__in=instance.blockers),
            many=True).data

    def get_count(self, instance):
        """ return the number of blockers per project
            to make it easier to count it in the frontend
        """
        return len(instance.blockers)















