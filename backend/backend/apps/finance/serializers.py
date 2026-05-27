from rest_framework import serializers
from .models import Budget, Expense, Income

# All valid category ids — mirrors frontend CategoryPicker exactly
VALID_CATEGORIES = {
    "food", "bills", "family", "healthcare", "fuel", "phone",
    "education", "entertainment", "shopping", "travel", "socializing",
    "withdrawal", "transfer", "transport", "housing", "miscellaneous",
}


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

    def validate_category(self, value):
        if value not in VALID_CATEGORIES:
            raise serializers.ValidationError(
                f"'{value}' is not a valid category. "
                f"Valid choices: {', '.join(sorted(VALID_CATEGORIES))}"
            )
        return value


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ("id", "amount", "description", "income_type", "date")

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

    def validate_income_type(self, value):
        valid = {"weekly", "monthly", "yearly"}
        if value not in valid:
            raise serializers.ValidationError(
                f"'{value}' is not valid. Choose from: weekly, monthly, yearly."
            )
        return value
