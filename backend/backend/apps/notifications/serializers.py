from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializes a Notification for the frontend bell dropdown.
    """
    class Meta:
        model = Notification
        fields = ("id", "type", "title", "message", "is_read", "created_at")
        read_only_fields = ("id", "type", "title", "message", "created_at")
