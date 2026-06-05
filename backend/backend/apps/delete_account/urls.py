from django.urls import path
from . import views

urlpatterns = [
    path("delete/", views.delete_account, name="account-delete"),
]
