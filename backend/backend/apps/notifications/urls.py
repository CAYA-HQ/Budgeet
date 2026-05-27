from django.urls import path
from . import views

urlpatterns = [
    path("", views.list_notifications, name="notifications-list"),
    path("read-all/", views.mark_all_read, name="notifications-read-all"),
    path("<int:pk>/read/", views.notification_detail, name="notification-read"),
    path("<int:pk>/", views.notification_detail, name="notification-delete"),
]
