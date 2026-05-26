# Budgeet — Django REST API

Built with Django 5, Django REST Framework, and JWT authentication.

---

## Project Structure

```
budgeet_backend/
├── manage.py
├── requirements.txt
├── .env.example
│
├── budgeet/                  # Django project package
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
└── apps/
    ├── auth_app/             # Custom user model + auth endpoints
    │   ├── models.py         # User (email-based, no username)
    │   ├── serializers.py
    │   ├── views.py          # register, login, google_auth, me
    │   ├── admin.py
    │   └── urls.py
    │
    └── finance/              # Budget, Expense, Income
        ├── models.py
        ├── serializers.py
        ├── views.py          # budget, expenses, incomes, summary
        ├── admin.py
        └── urls.py
```

---

## Quick Start

### 1. Clone & create a virtual environment

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Create your `.env` file

```bash
cp .env.example .env
# Then edit .env and set DJANGO_SECRET_KEY at minimum
```

### 3. Run migrations & start the server

```bash
python manage.py migrate
python manage.py createsuperuser   # optional — for /admin access
python manage.py runserver         # → http://localhost:8000
```

The frontend (Vite on port 5173) will be able to reach the API at `http://localhost:8000`.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DJANGO_SECRET_KEY` | insecure default | **Change in production** |
| `DEBUG` | `True` | Set `False` in production |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated hosts |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...` | Comma-separated origins |
| `GOOGLE_CLIENT_ID` | *(empty)* | Required only for Google sign-in |
| `GOOGLE_CLIENT_SECRET` | *(empty)* | Required only for Google sign-in |

---

## API Reference

All **finance endpoints** require:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /api/auth/register/`

```json
// Request
{ "name": "Immanuel Doe", "email": "immanuel@email.com", "password": "secret123" }

// Response 201
{ "user": { "id": 1, "name": "Immanuel Doe", "email": "immanuel@email.com" }, "token": "eyJ..." }
```

#### `POST /api/auth/login/`

```json
// Request
{ "email": "immanuel@email.com", "password": "secret123" }

// Response 200
{ "user": { "id": 1, "name": "Immanuel Doe", "email": "immanuel@email.com" }, "token": "eyJ..." }
```

#### `POST /api/auth/google/`

Called automatically by `GoogleAuthCallback.jsx` after the Google redirect.

```json
// Request
{ "code": "...", "code_verifier": "...", "redirect_uri": "http://localhost:5173/auth/google/callback", "state": "..." }

// Response 200 / 201
{ "user": { ... }, "token": "eyJ..." }
```

#### `GET /api/auth/me/`  *(requires token)*

Returns the currently authenticated user.

---

### Finance

#### `POST /api/finance/budget/`  — Set / update monthly budget

```json
// Request
{ "amount": 150000, "month": "2025-05" }

// Response 200
{ "id": 1, "amount": "150000.00", "month": "2025-05" }
```

`month` defaults to the current month if omitted.  
Calling this again for the same month **updates** the existing record (upsert).

#### `GET /api/finance/budget/?month=2025-05`

Returns the budget for the given month (current month if omitted).

---

#### `POST /api/finance/expenses/`  — Add expense

```json
// Request
{ "label": "Groceries", "amount": 5000, "category": "food", "date": "2025-05-13" }

// Response 201
{ "id": 1, "label": "Groceries", "amount": "5000.00", "category": "food", "date": "2025-05-13" }
```

**Valid categories:** `food`, `transport`, `entertainment`, `health`, `shopping`, `utilities`, `education`, `housing`, `other`

#### `GET /api/finance/expenses/?month=2025-05`  — List expenses + summary

```json
// Response 200
{
  "budget": { "id": 1, "amount": "150000.00", "month": "2025-05" },
  "expenses": [
    { "id": 1, "label": "Groceries", "amount": "5000.00", "category": "food", "date": "2025-05-13" }
  ],
  "total_spent": 5000,
  "remaining": 145000
}
```

#### `GET /api/finance/expenses/<id>/`  — Single expense
#### `PUT /api/finance/expenses/<id>/`  — Full update
#### `PATCH /api/finance/expenses/<id>/`  — Partial update
#### `DELETE /api/finance/expenses/<id>/`  — Delete (returns 204)

---

#### `POST /api/finance/incomes/`  — Add income

```json
// Request
{ "amount": 300000, "description": "Monthly salary", "income_type": "monthly", "date": "2025-05-01" }

// Response 201
{ "id": 1, "amount": "300000.00", "description": "Monthly salary", "income_type": "monthly", "date": "2025-05-01" }
```

**Valid income_type values:** `weekly`, `monthly`, `yearly`

#### `GET /api/finance/incomes/?month=2025-05`
#### `GET /api/finance/incomes/<id>/`
#### `PUT/PATCH /api/finance/incomes/<id>/`
#### `DELETE /api/finance/incomes/<id>/`  — Returns 204

---

#### `GET /api/finance/summary/?month=2025-05`  — Full month snapshot

```json
{
  "month": "2025-05",
  "budget": { "id": 1, "amount": "150000.00", "month": "2025-05" },
  "total_spent": 5000,
  "remaining": 145000,
  "total_income": 300000,
  "net": 295000,
  "expenses": [...],
  "incomes": [...]
}
```

---

## Error Responses

All error responses use this shape (matching what the frontend checks with `data.message`):

```json
{ "message": "Human-readable error description." }
```

| Status | Meaning |
|---|---|
| 400 | Validation error / bad request |
| 401 | Missing or invalid token / wrong credentials |
| 403 | Account deactivated |
| 404 | Resource not found |

---

## Admin Panel

Visit `http://localhost:8000/admin/` after creating a superuser. All models (Users, Budgets, Expenses, Incomes) are registered with search and filtering.

---

## Frontend Integration Notes

- The frontend hardcodes `http://localhost:8000` as the API base — no changes needed for local dev.
- Token is returned on register and login — store it in `localStorage` and send as `Authorization: Bearer <token>` on all finance requests.
- The `month` field in budget and expense queries uses `YYYY-MM` format (e.g. `"2025-05"`).
