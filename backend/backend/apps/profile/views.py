"""
profile/views.py
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Profile
from .serializers import (
    ProfileDetailSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
)

User = get_user_model()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_AVATAR_SIZE_MB = 5


def _get_or_create_profile(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def _first_error(serializer_errors):
    first = next(iter(serializer_errors.values()))
    if isinstance(first, list):
        first = first[0]
    return str(first)


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    """GET or PATCH the authenticated user's profile."""
    user = request.user
    _get_or_create_profile(user)

    if request.method == "GET":
        return Response(
            ProfileDetailSerializer(user, context={"request": request}).data
        )

    # PATCH
    serializer = UpdateProfileSerializer(
        data=request.data,
        context={"request": request},
    )
    if not serializer.is_valid():
        return Response(
            {"message": _first_error(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = serializer.validated_data
    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        user.email = data["email"]
    user.save()

    return Response(
        ProfileDetailSerializer(user, context={"request": request}).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_avatar(request):
    """
    POST /api/profile/avatar/
   
    """
    file = request.FILES.get("avatar")

    if not file:
        return Response(
            {"message": "No image file provided. Send a file with field name 'avatar'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        return Response(
            {"message": f"Invalid file type '{file.content_type}'. Allowed: JPEG, PNG, WebP, GIF."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    max_bytes = MAX_AVATAR_SIZE_MB * 1024 * 1024
    if file.size > max_bytes:
        return Response(
            {"message": f"Image too large. Maximum size is {MAX_AVATAR_SIZE_MB}MB."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    prof = _get_or_create_profile(request.user)

    # Delete old avatar file from disk before saving new one
    if prof.avatar:
        try:
            prof.avatar.delete(save=False)
        except Exception:
            pass

    prof.avatar = file
    prof.save()

    avatar_url = request.build_absolute_uri(prof.avatar.url)
    return Response({"avatar_url": avatar_url}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """POST /api/profile/change-password/"""
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={"request": request},
    )
    if not serializer.is_valid():
        return Response(
            {"message": _first_error(serializer.errors)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save()

    return Response({"message": "Password updated successfully."})
