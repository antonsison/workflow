from django.urls import path, re_path
from .views import Payroll, PayrollReport

urlpatterns = [
    path('', Payroll.as_view({
        'get': 'filter',
        'put': 'put'
    }), name="payroll-list"),
    
    path('<int:id>/', Payroll.as_view({
        'get': 'get'
    }), name="payroll-detail"),

    path('<int:id>/report/', PayrollReport.as_view({
        'get': 'download_pdf'
    }), name='payroll-report'),

    path('report/', PayrollReport.as_view({
        'post': 'send_pdf'
    }), name='payroll-report-post'),
]