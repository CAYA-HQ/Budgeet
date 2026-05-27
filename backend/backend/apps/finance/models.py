from django.db import models
from django.conf import settings


class Budget(models.Model):
    """One budget record per user per calendar month."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    # Stored as "YYYY-MM" e.g. "2025-05"
    month = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "month")
        ordering = ["-month"]

    def __str__(self):
        return f"{self.user.email} — {self.month} — ₦{self.amount}"


class Expense(models.Model):
    CATEGORY_CHOICES = [
        # Matches frontend CategoryPicker exactly
        ("food",          "Food"),
        ("bills",         "Bills/Utilities"),
        ("family",        "Family"),
        ("healthcare",    "Healthcare"),
        ("fuel",          "Fuel"),
        ("phone",         "Phone/Internet"),
        ("education",     "Education"),
        ("entertainment", "Entertainment"),
        ("shopping",      "Shopping"),
        ("travel",        "Travel"),
        ("socializing",   "Socializing"),
        ("withdrawal",    "Withdrawal"),
        ("transfer",      "Transfer"),
        ("transport",     "Transportation"),
        ("housing",       "Housing"),
        ("miscellaneous", "Miscellaneous"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="expenses",
    )
    label = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.label} — ₦{self.amount} ({self.date})"


class Income(models.Model):
    INCOME_TYPE_CHOICES = [
        ("weekly", "Weekly"),
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="incomes",
    )
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    income_type = models.CharField(
        max_length=10, choices=INCOME_TYPE_CHOICES, default="monthly"
    )
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user.email} — ₦{self.amount} ({self.income_type}) {self.date}"
