from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "has_avatar", "updated_at")
    search_fields = ("user__email", "user__name")
    readonly_fields = ("created_at", "updated_at")

    def has_avatar(self, obj):
        return bool(obj.avatar)
    has_avatar.boolean = True
    has_avatar.short_description = "Has Avatar"
