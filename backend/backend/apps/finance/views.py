from datetime import date as date_type

from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Budget, Expense, Income
from apps.notifications.service import (
    notify_expense_added,
    notify_income_added,
    notify_budget_set,
)
from .serializers import BudgetSerializer, ExpenseSerializer, IncomeSerializer


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _current_month() -> str:
    today = date_type.today()
    return today.strftime("%Y-%m")


# ─── Budget ───────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def budget(request):
    """
    POST /api/finance/budget/

    GET /api/finance/budget/
        
    """
    user = request.user

    if request.method == "POST":
        data = request.data.copy()
        if "month" not in data:
            data["month"] = _current_month()

        month = data.get("month")

        # Upsert: update if exists, create otherwise
        instance = Budget.objects.filter(user=user, month=month).first()
        serializer = BudgetSerializer(instance, data=data) if instance else BudgetSerializer(data=data)

        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({"message": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)

        budget_obj = serializer.save(user=user)
        notify_budget_set(user, budget_obj, updated=instance is not None)
        return Response(BudgetSerializer(budget_obj).data, status=status.HTTP_200_OK)

    # GET — return current month's budget
    month = request.query_params.get("month", _current_month())
    budget_obj = Budget.objects.filter(user=user, month=month).first()
    if not budget_obj:
        return Response({"budget": None, "month": month})
    return Response(BudgetSerializer(budget_obj).data)


# ─── Expenses ─────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def expenses(request):
    """
    POST /api/finance/expenses/
        
    GET /api/finance/expenses/
        
    """
    user = request.user

    if request.method == "POST":
        serializer = ExpenseSerializer(data=request.data)
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({"message": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)

        expense_obj = serializer.save(user=user)
        notify_expense_added(user, expense_obj)
        return Response(ExpenseSerializer(expense_obj).data, status=status.HTTP_201_CREATED)

    # GET
    month = request.query_params.get("month", _current_month())
    year_str, month_str = month.split("-")

    qs = Expense.objects.filter(
        user=user,
        date__year=int(year_str),
        date__month=int(month_str),
    )

    total_spent = qs.aggregate(total=Sum("amount"))["total"] or 0

    budget_obj = Budget.objects.filter(user=user, month=month).first()
    budget_data = BudgetSerializer(budget_obj).data if budget_obj else None
    remaining = (budget_obj.amount - total_spent) if budget_obj else None

    return Response(
        {
            "budget": budget_data,
            "expenses": ExpenseSerializer(qs, many=True).data,
            "total_spent": total_spent,
            "remaining": remaining,
        }
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def expense_detail(request, pk):
    """
    GET    /api/finance/expenses/<pk>/  — retrieve a single expense
    PUT    /api/finance/expenses/<pk>/  — full update
    PATCH  /api/finance/expenses/<pk>/  — partial update
    DELETE /api/finance/expenses/<pk>/  — delete
    """
    try:
        expense_obj = Expense.objects.get(pk=pk, user=request.user)
    except Expense.DoesNotExist:
        return Response({"message": "Expense not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(ExpenseSerializer(expense_obj).data)

    if request.method in ("PUT", "PATCH"):
        partial = request.method == "PATCH"
        serializer = ExpenseSerializer(expense_obj, data=request.data, partial=partial)
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({"message": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    # DELETE
    expense_obj.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Income ───────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def incomes(request):
    """
    POST /api/finance/incomes/
        Body: { amount, description, income_type, date }

    GET /api/finance/incomes/
        Returns all income entries for the authenticated user.
        Optional: ?month=YYYY-MM to filter by month.
    """
    user = request.user

    if request.method == "POST":
        serializer = IncomeSerializer(data=request.data)
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({"message": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)
        income_obj = serializer.save(user=user)
        notify_income_added(user, income_obj)
        return Response(IncomeSerializer(income_obj).data, status=status.HTTP_201_CREATED)

    # GET
    month = request.query_params.get("month")
    qs = Income.objects.filter(user=user)
    if month:
        try:
            year_str, month_str = month.split("-")
            qs = qs.filter(date__year=int(year_str), date__month=int(month_str))
        except ValueError:
            return Response({"message": "Invalid month format."}, status=status.HTTP_400_BAD_REQUEST)

    total_income = qs.aggregate(total=Sum("amount"))["total"] or 0
    return Response(
        {
            "incomes": IncomeSerializer(qs, many=True).data,
            "total_income": total_income,
        }
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def income_detail(request, pk):
    """
    GET    /api/finance/incomes/<pk>/
    PUT    /api/finance/incomes/<pk>/
    PATCH  /api/finance/incomes/<pk>/
    DELETE /api/finance/incomes/<pk>/
    """
    try:
        income_obj = Income.objects.get(pk=pk, user=request.user)
    except Income.DoesNotExist:
        return Response({"message": "Income record not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(IncomeSerializer(income_obj).data)

    if request.method in ("PUT", "PATCH"):
        partial = request.method == "PATCH"
        serializer = IncomeSerializer(income_obj, data=request.data, partial=partial)
        if not serializer.is_valid():
            first_error = next(iter(serializer.errors.values()))[0]
            return Response({"message": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)

    income_obj.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Summary ──────────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    """
    GET /api/finance/summary/
    
    """
    user = request.user
    month = request.query_params.get("month", _current_month())

    try:
        year_str, month_str = month.split("-")
        year, mon = int(year_str), int(month_str)
    except ValueError:
        return Response({"message": "Invalid month format. Use YYYY-MM."}, status=status.HTTP_400_BAD_REQUEST)

    expense_qs = Expense.objects.filter(user=user, date__year=year, date__month=mon)
    income_qs = Income.objects.filter(user=user, date__year=year, date__month=mon)

    total_spent = expense_qs.aggregate(total=Sum("amount"))["total"] or 0
    total_income = income_qs.aggregate(total=Sum("amount"))["total"] or 0

    budget_obj = Budget.objects.filter(user=user, month=month).first()
    budget_data = BudgetSerializer(budget_obj).data if budget_obj else None
    remaining = (budget_obj.amount - total_spent) if budget_obj else None

    return Response(
        {
            "month": month,
            "budget": budget_data,
            "total_spent": total_spent,
            "remaining": remaining,
            "total_income": total_income,
            "net": total_income - total_spent,
            "expenses": ExpenseSerializer(expense_qs, many=True).data,
            "incomes": IncomeSerializer(income_qs, many=True).data,
        }
    )
