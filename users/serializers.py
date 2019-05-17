import datetime

from django.conf import settings
from django.contrib.auth import authenticate
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import User, SlackToken, TimeLog
from .slack import Slack


class AuthTokenSerializer(serializers.Serializer):
    """ auth token serializer
    """
    user = None

    email = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        return super(AuthTokenSerializer, self).__init__(*args, **kwargs)

    def validate(self, data):
        """ validate email credentials
        """
        email, password = data.values()

        if not email or not password:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        self.user = authenticate(request=self.request,
            email=email, password=password)

        if not self.user:
            msg = _('Unable to log in with provided credentials.')
            raise serializers.ValidationError(msg, code='authorization')

        return data

    def get_token(self):
        """ get or generate a user token that is valid for
            `settings.AUTH_TOKEN_EXPIRY_TIME`
        """
        if not self.user:
            msg = _('Unable to login with provided credentials.')
            raise serializers.ValidationError(msg, code="authorization")

        token, created = Token.objects.get_or_create(user=self.user)
        expiry_date = token.created + datetime.timedelta(days=settings.AUTH_TOKEN_EXPIRY_TIME)
        
        if not created and expiry_date < timezone.now():
            # delete token
            token.delete()
            # generate a new one
            token = Token.objects.create(user=self.user)

        return token


class ShortUserSerializer(serializers.ModelSerializer):
    """ user serializer with only basic
        information.
    """
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'image',
            'birthdate',
        )

    def get_full_name(self, instance):
        """ return the complete name of
            the user.
        """
        return instance.get_full_name()


class UserSerializer(serializers.ModelSerializer):
    """ user serializer
    """
    has_usable_pass = serializers.SerializerMethodField(read_only=True)
    deductions = serializers.SerializerMethodField(read_only=True)
    plans = serializers.SerializerMethodField(read_only=True)
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'birthdate',
            'image',
            'position',
            'position_type',
            'date_started',
            'deductions',
            'plans',
            'has_usable_pass'
        )

    def __init__(self, *args, **kwargs):
        return super(UserSerializer, self).__init__(*args, **kwargs)

    def get_deductions(self, instance):
        """ get the list of deduction from
            the payroll app.
        """
        # imported implicitly as it will raise a circular import
        # error when imported globally. `uses.serializers` is imported
        # in the payroll.serializers.
        from payroll.serializers import DeductionSerializer

        return DeductionSerializer(instance.deductions.all(), many=True).data
    
    def get_has_usable_pass(self, instance):
        return instance.has_usable_password()

    def get_plans(self, instance):
        """ get the list of plans from the
            payroll app.
        """
        # imported implicitly as it will raise a circular import
        # error when imported globally. `uses.serializers` is imported
        # in the payroll.serializers.
        from payroll.serializers import PlanSerializer

        return PlanSerializer(
            PlanSerializer.Meta.model.objects.filter(user=instance),
            many=True,
        ).data

    def get_full_name(self, instance):
        """ return the complete name of
            the user.
        """
        return instance.get_full_name()

class SlackAuthSerializer(Slack, serializers.Serializer):
    """ slack auth serializer
    """
    token = None
    code = serializers.CharField(write_only=True)

    class Meta:
        model = SlackToken

    def validate(self, data):
        """ check if the code is valid and if the
            user is a valid member of the swiftkind
            team.
        """
        resp = self.auth_access(data.get('code'))
        data = self.parsedata(resp.read())

        # check if the request is successful. raise an
        # error message if the request is invalid
        if not data['ok']:
            raise serializers.ValidationError(_(data['error']), code="authorization")

        # check if the user is part of the team. Deny access to
        # users who are not part of the team.
        if data['team_id'] != settings.SLACK_TEAM_ID:
            raise serializers.ValidationError(_("Invalid user credentials."), code="authorization")

        # check if the user is an existing user. if new, create a new user,
        # else, allow access.
        resp = self.get_userinfo(data['user_id'], data['access_token'])
        userdata = self.parsedata(resp.read())

        if not userdata['ok']:
            raise serializers.ValidationError(_('User not found.'))

        user = self.get_or_create_user(
            email=userdata['user']['profile']['email'],
            first_name=userdata['user']['profile'].get('first_name'),
            last_name=userdata['user']['profile'].get('last_name'),
            id=data['user_id'],
        )
        # check if the user has no avatar yet.
        # add an avatar using the slack avatar.
        imgurl = userdata['user']['profile']['image_192']
        if not user.image:
            user.download_img(imgurl)
            user.save()

        # set access token
        self.token = self.get_or_create_token(
            access_token=data['access_token'], user=user)

        return data

    def get_redirect_url(self):
        """ return the redirect url based on the 
            generated access_token from the slack server
        """
        return f"{settings.SLACK_AUTH_LOGIN_REDIRECT}{self.token.token}/"

class PasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=False)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)


    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        return super(PasswordSerializer, self).__init__(*args, **kwargs)

    def validate(self, data):
        """
            validates data to check user credentials
        """ 

        if self.request.user.has_usable_password():
            old_password, new_password, confirm_new_password = data.values()
            if not self.request.user.check_password(old_password):
                raise serializers.ValidationError(_("Wrong old password."), code="authorization")
        else:
            new_password, confirm_new_password = data.values()
        
        if new_password != confirm_new_password:
            raise serializers.ValidationError(_("Passwords do not match."), code="authorization")

        return data     

    def validate_new_password(self, value):
        """
            validates inputed password if accepted by used django password verification
        """
        validate_password(value)
        return value
    
    def create(self, validated_data):
        """
            set new password for user
        """
        self.request.user.set_password(validated_data.get("new_password"))
        self.request.user.save()
        return self.request.user


class TimeLogSerializer(serializers.Serializer):
    """ timelog serializer for clock-in and clock-out
        from slack api
    """

    user = None
    team_id = serializers.CharField()
    channel_id = serializers.CharField()
    channel_name = serializers.CharField()
    user_id = serializers.CharField()
    
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
        
        return user_id
    
    def create(self, validated_data):
        """ create or update timelog instance
        """
        # calculate start and end of day time
        today_min = datetime.datetime.combine(timezone.now().date(), datetime.time.min)
        today_max = datetime.datetime.combine(timezone.now().date(), datetime.time.max)

        # check for time in logs for the day
        duplicate_time_check = TimeLog.objects.filter(user=self.user, time_in__range=(today_min, today_max))

        # if time log exist
        if duplicate_time_check.exists():
            raise serializers.ValidationError(
                _("attendance already recorded")
            )
        else:
            time_log = TimeLog.objects.create(user=self.user)

        return time_log
