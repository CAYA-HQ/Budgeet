from django.contrib import admin
from .models import Budget, Expense, Income


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("user", "month", "amount", "updated_at")
    list_filter = ("month",)
    search_fields = ("user__email", "user__name")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("user", "label", "amount", "category", "date")
    list_filter = ("category", "date")
    search_fields = ("user__email", "label")
    date_hierarchy = "date"


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ("user", "description", "amount", "income_type", "date")
    list_filter = ("income_type", "date")
    search_fields = ("user__email", "description")
    date_hierarchy = "date"
