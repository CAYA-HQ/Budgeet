"""
notifications/service.py
────────────────────────────────────────────────────────────────────────────
Central place for every piece of logic that decides WHEN and WHAT to notify.

─────────────────────────────────────────────────────────────────────────────
"""

from decimal import Decimal
from datetime import date, timedelta

from django.db.models import Sum

from .models import Notification


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _format_naira(amount):
    """Format a number as ₦1,000.00 for use in notification messages."""
    return f"₦{amount:,.2f}"


def _already_notified_today(user, notification_type):
    """
    Returns True if a notification of this type was already created for
    this user today. Prevents spamming the same alert multiple times
    when a user logs many expenses in one session.
    """
    today = date.today()
    return Notification.objects.filter(
        user=user,
        type=notification_type,
        created_at__date=today,
    ).exists()


# ─── Budget status utility ────────────────────────────────────────────────────

def check_budget_status(user, month):
    """
    Returns a dict describing how the user is doing against their budget
    for the given month (YYYY-MM string).

    """
    # Import here to avoid circular imports (finance imports notifications)
    from apps.finance.models import Budget, Expense

    year, mon = map(int, month.split("-"))

    budget_obj = Budget.objects.filter(user=user, month=month).first()
    total_spent = Expense.objects.filter(
        user=user,
        date__year=year,
        date__month=mon,
    ).aggregate(total=Sum("amount"))["total"] or Decimal("0")

    if not budget_obj:
        return {
            "has_budget": False,
            "budget_amount": Decimal("0"),
            "total_spent": total_spent,
            "remaining": None,
            "percent_used": 0,
        }

    budget_amount = Decimal(str(budget_obj.amount))
    remaining = budget_amount - total_spent
    percent_used = int((total_spent / budget_amount) * 100) if budget_amount else 0

    return {
        "has_budget": True,
        "budget_amount": budget_amount,
        "total_spent": total_spent,
        "remaining": remaining,
        "percent_used": percent_used,
    }


# ─── Notification creators ────────────────────────────────────────────────────

def notify_welcome(user):
    """
    Creates a one-time welcome notification when a user first registers.
    This appears in the bell dropdown immediately after signup.
    """
    first_name = user.name.split()[0] if user.name else "there"

    Notification.objects.create(
        user=user,
        type="welcome",
        title="Welcome to Budgeet ",
        message=(
            f"Hi {first_name}! Your account is ready. "
            "Start by setting your monthly budget, then log your first expense."
        ),
    )


def notify_expense_added(user, expense):
    """
    Called every time an expense is successfully saved.
    """
    # 1 — Expense confirmation
    Notification.objects.create(
        user=user,
        type="expense_added",
        title="Expense Logged",
        message=(
            f"{_format_naira(expense.amount)} recorded for "
            f'"{expense.label}" under {expense.category.title()}.'
        ),
    )

    # 2 — Budget health check
    month = expense.date.strftime("%Y-%m")
    status = check_budget_status(user, month)

    if not status["has_budget"]:
        return   # No budget set — nothing to warn about

    percent = status["percent_used"]

    if percent >= 100:
        # Over budget
        if not _already_notified_today(user, "budget_exceeded"):
            overspend = status["total_spent"] - status["budget_amount"]
            Notification.objects.create(
                user=user,
                type="budget_exceeded",
                title="Budget Exceeded ⚠️",
                message=(
                    f"You have exceeded your {expense.date.strftime('%B')} budget by "
                    f"{_format_naira(overspend)}. "
                    "Consider reviewing your spending."
                ),
            )

    elif percent >= 80:
        # Approaching limit
        if not _already_notified_today(user, "budget_alert"):
            Notification.objects.create(
                user=user,
                type="budget_alert",
                title="Budget Alert 🔔",
                message=(
                    f"You have used {percent}% of your "
                    f"{expense.date.strftime('%B')} budget. "
                    f"Only {_format_naira(status['remaining'])} remaining."
                ),
            )

    elif percent < 50:
        # Doing well — only notify once per day to avoid noise
        if not _already_notified_today(user, "on_track"):
            Notification.objects.create(
                user=user,
                type="on_track",
                title="You're On Track ",
                message=(
                    f"Great discipline! You've used {percent}% of your "
                    f"{expense.date.strftime('%B')} budget so far. Keep it up."
                ),
            )


def notify_income_added(user, income):
    """
    Creates an income_added confirmation notification when income is logged.
    """
    Notification.objects.create(
        user=user,
        type="income_added",
        title="Income Recorded ",
        message=(
            f"{_format_naira(income.amount)} ({income.income_type.title()}) "
            f"has been added to your {income.date.strftime('%B')} income."
        ),
    )


def notify_budget_set(user, budget, updated=False):
    """
    Creates a confirmation notification when a budget is set or updated.

    updated=True  → "Budget Updated" message
    updated=False → "Budget Set" message
    """
    from calendar import month_name
    year, mon = map(int, budget.month.split("-"))
    month_label = f"{month_name[mon]} {year}"

    action = "updated" if updated else "set"

    Notification.objects.create(
        user=user,
        type="budget_alert",
        title=f"Budget {action.title()}",
        message=(
            f"Your budget for {month_label} has been {action} to "
            f"{_format_naira(budget.amount)}."
        ),
    )
