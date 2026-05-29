from django.db import models
from django.conf import settings


def avatar_upload_path(instance, filename):
    """
    Saves avatars to: media/avatars/<user_id>/<filename>
    Each user gets their own folder so files never clash.
    """
    ext = filename.rsplit(".", 1)[-1].lower()
    return f"avatars/{instance.user.id}/avatar.{ext}"


class Profile(models.Model):
    """
    Extends User with avatar image storage.

    avatar — stores the actual uploaded image file on disk under MEDIA_ROOT.
             Served at /media/avatars/<user_id>/avatar.<ext>
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    avatar = models.ImageField(
        upload_to=avatar_upload_path,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile({self.user.email})"

    @property
    def avatar_url(self):
        """
        Returns the full URL of the avatar if one exists,
        otherwise returns an empty string.
        Frontend checks this to decide whether to show
        the initials avatar or the real image.
        """
        if self.avatar and hasattr(self.avatar, "url"):
            return self.avatar.url
        return ""
