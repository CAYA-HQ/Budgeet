from django.urls import path
from . import views

urlpatterns = [
    path("budget/", views.budget, name="finance-budget"),
    path("expenses/", views.expenses, name="finance-expenses"),
    path("expenses/<int:pk>/", views.expense_detail, name="finance-expense-detail"),
    path("incomes/", views.incomes, name="finance-incomes"),
    path("incomes/<int:pk>/", views.income_detail, name="finance-income-detail"),
    path("summary/", views.summary, name="finance-summary"),
]
