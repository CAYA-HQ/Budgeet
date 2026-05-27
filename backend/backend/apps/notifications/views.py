"""
notifications/views.py
────────────────────────────────────────────────────────────────────────────
All notification endpoints require authentication (JWT Bearer token).

Endpoints
─────────────────────────────────────────────────────────────────────────────
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """
    GET /api/notifications/
    Returns all notifications for the user with an unread count.
    """
    qs = Notification.objects.filter(user=request.user)
    unread_count = qs.filter(is_read=False).count()

    return Response({
        "unread_count": unread_count,
        "notifications": NotificationSerializer(qs, many=True).data,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    POST /api/notifications/read-all/
    Marks all unread notifications as read.
    Called when user opens the bell dropdown.
    """
    updated = Notification.objects.filter(
        user=request.user,
        is_read=False,
    ).update(is_read=True)

    return Response({"marked_read": updated})


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def notification_detail(request, pk):
    """
    POST   /api/notifications/<id>/read/   → mark single as read
    DELETE /api/notifications/<id>/        → delete it
    """
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response(
            {"message": "Notification not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "DELETE":
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # POST → mark as read
    notification.is_read = True
    notification.save(update_fields=["is_read"])
    return Response(NotificationSerializer(notification).data)
