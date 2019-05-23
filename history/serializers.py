import datetime

from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from django.utils import timezone
from rest_framework import serializers

from users.models import User
from users.serializers import ShortUserSerializer

from accounting.serializers import ProjectSerializer

from .mixins import DailyStandup, SearchFeedParser
from .models import Standup, Done, Todo, Blocker


class StandupSerializer(DailyStandup, serializers.Serializer):
    """ standup serializer
    """
    team_id = serializers.CharField()
    channel_id = serializers.CharField()
    channel_name = serializers.CharField()
    user_id = serializers.CharField()
    text = serializers.CharField()

    user, done, todo, blocker = (None, None, None, None)

    class Meta:
        model = Standup

    def validate_team_id(self, team_id):
        """ validate if the team source of the
            request came from the right team. (swiftkind)
            if not, deny access.
        """
        if team_id != settings.SLACK_TEAM_ID:
            raise serializers.ValidationError(
                _('[Invalid Request] Wrong workspace.'),
                code="invalid_request",
            )

        return team_id

    def validate_user_id(self, user_id):
        """ validate if the user is a valid member
            of the workspace.
        """
        self.user = User.objects.filter(slack_id=user_id).first()
        if not self.user:
            raise serializers.ValidationError(
                _('[Invalid Request] Requestor is not a registered user.'),
                code="invalid_request",
            )

        # check if the user has already sent the report
        # for the specified channel.
        today_min = datetime.datetime.combine(timezone.now().date(), datetime.time.min)
        today_max = datetime.datetime.combine(timezone.now().date(), datetime.time.max)

        channel_id = self.initial_data.get('channel_id')
        standup = self.Meta.model.objects.filter(
            user=self.user,
            project__channel_id=channel_id,
            date_created__range=(today_min, today_max)
        )
        if standup.exists():
            raise serializers.ValidationError(
                _("You have posted a report already today."))
        
        return user_id

    def validate_text(self, text):
        """ validate if text is in the correct format
        """
        try:
            self.done, self.todo, self.blocker = self.splitreport(text)
            return text

        except ValueError as e:
            raise serializers.ValidationError(
                _("[Format Error] Invalid report format."),
                code="invalid_format",
            )

    def create(self, data):
        """ save the request data as standup report
        """
        # create a new standup instance. set the user
        # based on the user_slack_id.
        standup = self.Meta.model(
            raw=self.to_json(self.initial_data),
            user=self.user,
            project=self.get_project(
                data['channel_id'],
                data['channel_name'],
                self.get_user_token(self.user).token
            )
        )
        standup.save()

        # set #1 (what i have worked on).
        for report in self.done:
            standup.add_done(**report)
        # set #2 (what i am planning to do).
        for report in self.todo:
            standup.add_todo(**report)
        # set #3 (Issues/blockers).
        for report in self.blocker:
            standup.add_blocker(**report)

        return data


class ShortStandupSerializer(serializers.ModelSerializer):
    user = ShortUserSerializer()
    project = ProjectSerializer()

    class Meta:
        model = Standup
        fields = (
            'id',
            'date_created',
            'date_updated',
            'project',
            'user',
        )



class DoneSerializer(serializers.ModelSerializer):
    standup = ShortStandupSerializer()

    class Meta:
        model = Done
        fields = (
            'id',
            'standup',
            'content',
            'reference',
            'hours',
            'date_created',
            'date_updated'
        )


class TodoSerializer(serializers.ModelSerializer):
    standup = ShortStandupSerializer()

    class Meta:
        model = Todo
        fields = (
            'id',
            'standup',
            'content',
            'reference',
            'date_created',
            'date_updated'
        )


class BlockerSerializer(serializers.ModelSerializer):
    standup = ShortStandupSerializer()
    
    class Meta:
        model = Blocker
        fields = (
            'id',
            'standup',
            'content',
            'reference',
            'is_fixed',
            'date_created',
            'date_updated'
        )

class ReportSerializer(serializers.ModelSerializer):
    """ standup report read only serializer
    """
    user = ShortUserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)

    total_hours = serializers.SerializerMethodField()
    done = serializers.SerializerMethodField()
    todo = serializers.SerializerMethodField()
    blockers = serializers.SerializerMethodField()
    pending_issues = serializers.SerializerMethodField()

    class Meta:
        model = Standup
        fields = (
            'id',
            'user',
            'project',
            'date_created',
            'total_hours',
            'done',
            'todo',
            'blockers',
            'pending_issues'
        )

    def get_total_hours(self, obj):
        return f"{obj.total_hours:.2f}"

    def get_done(self, obj):
        return DoneSerializer(
            Done.objects.filter(standup=obj), many=True).data

    def get_todo(self, obj):
        return TodoSerializer(
            Todo.objects.filter(standup=obj), many=True).data

    def get_blockers(self, obj):
        return BlockerSerializer(
            Blocker.objects.filter(standup=obj), many=True).data

    def get_pending_issues(self, obj):
        return Blocker.objects.filter(standup=obj, is_fixed=False).count()


class ShortStandupProjectSerializer(serializers.ModelSerializer):
    user = ShortUserSerializer()

    total_hours = serializers.SerializerMethodField()
    done = serializers.SerializerMethodField()
    todo = serializers.SerializerMethodField()
    blockers = serializers.SerializerMethodField()
    pending_issues = serializers.SerializerMethodField()
    finished_issues = serializers.SerializerMethodField()

    class Meta:
        model = Standup
        fields = (
            'id',
            'date_created',
            'date_updated',
            'user',
            'total_hours',
            'done',
            'todo',
            'blockers',
            'pending_issues',
            'finished_issues'
        )
    
    def get_total_hours(self, obj):
        return f"{obj.total_hours:.2f}"

    def get_done(self, obj):
        return DoneSerializer(
            Done.objects.filter(standup=obj), many=True).data

    def get_todo(self, obj):
        return TodoSerializer(
            Todo.objects.filter(standup=obj), many=True).data

    def get_blockers(self, obj):
        return BlockerSerializer(
            Blocker.objects.filter(standup=obj), many=True).data

    def get_pending_issues(self, obj):
        return Blocker.objects.filter(standup=obj, is_fixed=False).count()
    
    def get_finished_issues(self, obj):
        return Blocker.objects.filter(standup=obj, is_fixed=True).count()

class SearchSerializer(SearchFeedParser, serializers.Serializer):
    """ feed serializer
    """
    instance = serializers.SerializerMethodField()
    instance_type = serializers.SerializerMethodField()

    def get_instance(self, obj):
        return self.serialize(obj)

    def get_instance_type(self, obj):
        return obj._meta.model_name
