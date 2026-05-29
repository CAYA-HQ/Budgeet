from django.urls import path
from . import views

urlpatterns = [
    path("", views.profile, name="profile"),
    path("avatar/", views.upload_avatar, name="profile-avatar"),
    path("change-password/", views.change_password, name="profile-change-password"),
]
