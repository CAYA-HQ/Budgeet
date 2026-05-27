from rest_framework import serializers
from .models import Budget, Expense, Income


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = ("id", "amount", "month")

    def validate_month(self, value):
        import re
        if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", value):
            raise serializers.ValidationError(
                "month must be in YYYY-MM format, e.g. '2025-05'."
            )
        return value


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ("id", "label", "amount", "category", "date")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ("id", "amount", "description", "income_type", "date")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
