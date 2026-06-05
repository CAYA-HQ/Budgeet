"""
delete_account/views.py
────────────────────────────────────────────────────────────────────────────
Handles permanent account deletion.

"""

import os
import shutil
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    POST /api/account/delete/
    Permanently deletes the authenticated user and all their data.
    Requires the user's current password as confirmation.
    """
    user = request.user
    password = request.data.get("password", "").strip()

    # 1 — Password is required
    if not password:
        return Response(
            {"message": "Password is required to delete your account."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 2 — Verify the password is correct
    if not user.check_password(password):
        return Response(
            {"message": "Incorrect password. Please try again."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # 3 — Delete avatar files from disk before the DB row is gone
    _delete_avatar_files(user)

    # 4 — Delete the user — all related data cascades automatically
    user.delete()

    return Response(
        {"message": "Account deleted successfully."},
        status=status.HTTP_200_OK,
    )


def _delete_avatar_files(user):
    """
    Removes the user's avatar folder from disk.
    Path: MEDIA_ROOT/avatars/<user_id>/
    Silently ignores errors so a missing folder never blocks deletion.
    """
    try:
        avatar_dir = os.path.join(settings.MEDIA_ROOT, "avatars", str(user.id))
        if os.path.isdir(avatar_dir):
            shutil.rmtree(avatar_dir)
    except Exception as e:
        # Log but never block account deletion
        print(f"[Budgeet] Could not delete avatar files for user {user.id}: {e}")
