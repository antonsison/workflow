from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class Payroll(models.Model):
    """ payroll worksheet
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
        blank=True, null=True, on_delete=models.SET_NULL)

    payroll_code = models.CharField(max_length=15, null=True, blank=True)

    date_from = models.DateField(blank=True, null=True)
    date_to = models.DateField(blank=True, null=True)

    total_deduction = models.DecimalField(max_digits=999, decimal_places=2, default=0.00)
    gross_pay = models.DecimalField(max_digits=999, decimal_places=2, default=0.00)
    net_pay = models.DecimalField(max_digits=999, decimal_places=2, default=0.00)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    is_sent = models.BooleanField(default=False)
    date_sent = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"({self.id}) {self.user}"

    def _generate_payroll_code(self):
        """ generate payroll code based on the
            employee information.
        """
        pr = Payroll.objects.filter(user=self.user)

        return f"{settings.PAYROLL_EMPLOYEE_ID}{self.user.id}{pr.count():04d}"


@receiver(post_save, sender=Payroll)
def auto_generate_payroll_code(sender, instance=None, created=False, **kwargs):
    # generate payroll code to new payroll
    # instance.
    if created:
        instance.payroll_code = instance._generate_payroll_code()
        instance.save()


class Deduction(models.Model):
    """ monthly deduction (benefits)
    """
    TIER1 = '1'
    TIER2 = '2'
    TIER3 = '3'
    TIER4 = '4'
    TIER5 = '5'
    TIER6 = '6'
    SALARY_TIER = (
        (TIER1, '15K'),
        (TIER2, '20K'),
        (TIER3, '25K'),
        (TIER4, '30K'),
        (TIER5, '35K'),
        (TIER6, '40K'),
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    tier = models.CharField(max_length=3, choices=SALARY_TIER, default=TIER1)

    amount = models.DecimalField(max_digits=999, decimal_places=2, default=0.00)
    er = models.DecimalField("Employer Participation",
        max_digits=999, decimal_places=2, default=0.00)
    ee = models.DecimalField("Empoyee Participation",
        max_digits=999, decimal_places=2, default=0.00)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"({self.get_tier_display()}) {self.name}"


class Plan(models.Model):
    """ monthly deduction (plans)
    """
    TERM1 = "1"
    TERM2 = "2"
    TERM3 = "3"
    TERM4 = "4"
    TERMS = (
        (TERM1, '6 months'),
        (TERM2, '12 months (1yr)'),
        (TERM3, '24 months (2yrs)'),
        (TERM4, '36 months (3yrs)'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL,
        blank=True, null=True, on_delete=models.SET_NULL)

    name = models.CharField(max_length=200)

    amount = models.DecimalField(max_digits=999, decimal_places=2, default=0.00)
    term = models.CharField(max_length=2, choices=TERMS, default=TERM1)
    monthly_ammort = models.DecimalField(max_digits=999, decimal_places=2, default=0.00)
    payment_count = models.PositiveIntegerField(default=0)

    date_from = models.DateField(blank=True, null=True)
    date_to = models.DateField(blank=True, null=True)

    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"({self.user}) {self.name}"

