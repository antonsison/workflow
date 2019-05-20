from rest_framework import serializers
from users.serializers import UserSerializer

from .models import Payroll, Deduction, Plan


class DeductionSerializer(serializers.ModelSerializer):
    """ deduction serializer
    """
    class Meta:
        model = Deduction
        fields = (
            'id',
            'name',
            'description',
            'tier',
            'amount',
            'er',
            'ee',
            'date_created',
            'date_updated',
        )


class PlanSerializer(serializers.ModelSerializer):
    """ plan serializer
    """
    class Meta:
        model = Plan
        fields = (
            'id',
            'name',
            'amount',
            'term',
            'monthly_ammort',
            'payment_count',
            'date_from',
            'date_to',
            'date_created',
            'date_updated'
        )


class PayrollSerializer(serializers.ModelSerializer):
    """ payroll serializer
    """
    user = UserSerializer(read_only=True)
    total_deduction = serializers.SerializerMethodField(read_only=True)
    gross_pay = serializers.SerializerMethodField(read_only=True)
    net_pay = serializers.SerializerMethodField(read_only=True)
    benefits = serializers.SerializerMethodField(read_only=True)
    plans = serializers.SerializerMethodField(read_only=True)
    payperiod_amount = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Payroll
        fields = (
            'id',
            'user',
            'payroll_code',
            'date_from',
            'date_to',
            'total_deduction',
            'gross_pay',
            'net_pay',
            'payperiod_amount',
            'date_created',
            'date_updated',
            'is_sent',
            'benefits',
            'plans',
            'date_sent'
        )

    def get_total_deduction(self, instance):
        return f"{instance.total_deduction:,}"

    def get_gross_pay(self, instance):
        return f"{instance.gross_pay:,}"

    def get_net_pay(self, instance):
        return f"{instance.net_pay:,}"

    def get_payperiod_amount(self, instance):
        return f"{instance.net_pay / 2:,}"

    def get_benefits(self, instance):
        return DeductionSerializer(
            instance.user.deductions.all(), many=True).data

    def get_plans(self, instance):
        return PlanSerializer(Plan.objects.filter(
            user=instance.user,
        ), many=True).data
