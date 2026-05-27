from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Represents a single notification for a user.
    """

    TYPE_CHOICES = [
        ("budget_alert",    "Budget Alert"),
        ("budget_exceeded", "Budget Exceeded"),
        ("on_track",        "On Track"),
        ("weekly_summary",  "Weekly Summary"),
        ("expense_added",   "Expense Added"),
        ("income_added",    "Income Added"),
        ("welcome",         "Welcome"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]   # newest first

    def __str__(self):
        return f"[{self.type}] {self.user.email} — {self.title}"
