from django.urls import path, re_path
from .views import Standups, Standup, StandupByWeek, ProjectBlockers, ProjectReport


urlpatterns = [
    path('standup/', Standups.as_view({
        'post': 'post',
        'get': 'get'
    }), name="standups"),

    path('standup/<int:id>/', Standup.as_view({
        'get': 'get'
    }), name="standup"),

    path('standup/weekly/', StandupByWeek.as_view(), name="standup-weekly"),

    path('project/<int:id>/report/', ProjectReport.as_view({
        'get':'get'
    }), name="project-report"),

    path('project/<int:id>/blockers/', ProjectBlockers.as_view({
        'get':'get'
    }), name="project-blockers"),
]