from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class ProfileDetailSerializer(serializers.ModelSerializer):
    """
    Returns User + avatar_url together
    """
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "name", "email", "avatar_url")

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        try:
            url = obj.profile.avatar_url
            # Build absolute URL so frontend doesn't need to prepend the base URL
            if url and request:
                return request.build_absolute_uri(url)
            return url
        except Profile.DoesNotExist:
            return obj.avatar or ""


class UpdateProfileSerializer(serializers.Serializer):
    """
    Validates PATCH /api/profile/
    """
    name = serializers.CharField(max_length=255, required=False)
    email = serializers.EmailField(required=False)

    def validate_email(self, value):
        user = self.context["request"].user
        if (
            User.objects.filter(email=value)
            .exclude(pk=user.pk)
            .exists()
        ):
            raise serializers.ValidationError(
                "This email is already in use by another account."
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """
    Validates POST /api/profile/change-password/
    """
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        return data

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
