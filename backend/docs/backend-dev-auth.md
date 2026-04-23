# Backend Auth API Notes

This document is for backend developers working on or extending the current authentication module.

## Current Surface Area

The API currently exposes:

- `GET /health`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

Route registration lives in `backend/internal/auth/routes.go`.

## Runtime Requirements

The API server starts from `backend/cmd/api/main.go`.

Current expectations:

- PostgreSQL must be available before the server starts.
- The running server uses `backend/pkg/db/db.go`, which opens a raw `database/sql` connection and pings the database.
- The current startup path runs versioned SQL migrations automatically before serving traffic.
- `JWT_SECRET` must be present in the environment for token signing and token validation.
- `PORT` defaults to `8080` if not set.

The checked-in `.env.example` currently includes database settings, but does not include `JWT_SECRET`. Add it locally before running the API.

## Response Contract

Success responses use this shape:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Error responses use this shape:

```json
{
  "success": false,
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human readable message"
  }
}
```

This contract is defined in `backend/pkg/response/response.go`. New handlers should reuse `response.Success(...)` and `response.Error(...)` to keep responses consistent.

## Auth Endpoints

### `POST /api/v1/auth/register`

Request body:

```json
{
  "email": "user@example.com",
  "password": "strongpass123"
}
```

Validation rules

- `email` is required
- `password` is required
- email must match the current regex validation in the handler
- password must be at least 8 characters

Success response:

- Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

Possible errors:

- `400 VALIDATION_ERROR` for malformed JSON, missing required fields, invalid email format, or short password
- `409 EMAIL_ALREADY_EXISTS` when the email is already in use
- `500 INTERNAL_ERROR` for unexpected database or token-generation failures

### `POST /api/v1/auth/login`

Request body:

```json
{
  "email": "user@example.com",
  "password": "strongpass123"
}
```

Success response:

- Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "accessToken": "jwt",
    "refreshToken": "jwt"
  }
}
```

Possible errors:

- `400 VALIDATION_ERROR` for malformed JSON or missing required fields
- `401 INVALID_CREDENTIALS` when the email does not exist or the password is wrong
- `500 INTERNAL_ERROR` for unexpected failures

### `POST /api/v1/auth/logout`

Expected header:

```http
Authorization: Bearer <refresh-token>
```

Important behavior:

- The logout handler expects the refresh token in the `Authorization` header.
- Logout revokes the stored hash of the refresh token.
- This endpoint does not accept the access token for logout semantics.

Success response:

- Status: `204 No Content`
- Body: empty

Possible errors:

- `401 UNAUTHORIZED` when the header is missing, malformed, or the refresh token is invalid/revoked/not found
- `500 INTERNAL_ERROR` for unexpected database failures

## Token Model

Token generation lives in `backend/internal/auth/service.go`.

Current behavior:

- access token expiry: `15 minutes`
- refresh token expiry: `7 days`
- both tokens are signed with `JWT_SECRET`
- refresh tokens are stored hashed with SHA-256
- refresh tokens are marked revoked on logout

Claims currently include:

- `userID`
- `email`
- standard JWT registered claims

## Protected Routes

Protected routes should use `backend/pkg/middleware/auth.go`.

Current middleware behavior:

- expects `Authorization: Bearer <access-token>`
- rejects missing or malformed headers
- rejects invalid or expired tokens
- places `userID` in Gin context

Current middleware error responses:

- `401 UNAUTHORIZED` with message `Authorization header is required`
- `401 UNAUTHORIZED` with message `Invalid or expired token`
- `401 UNAUTHORIZED` with message `Invalid token claims`

If you add protected handlers, read the user ID from context and keep the same bearer-token convention.

## Error Code Reference

These are the machine-readable error codes currently returned by auth and auth middleware:

- `VALIDATION_ERROR`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `UNAUTHORIZED`
- `INTERNAL_ERROR`

When adding new endpoints:

- prefer stable machine-readable codes
- keep messages human-readable but not security-sensitive
- avoid leaking whether a login email exists unless intentional

## Known Implementation Notes

- Registration validates email format explicitly, but login currently does not.
- `logout` uses a string comparison on `err.Error() == "UNAUTHORIZED"` instead of a typed/shared error.
- The server startup path uses `backend/pkg/db/migrations` and does not rely on the older GORM auto-migration code in `backend/internal/database/database.go`.
- There is no refresh endpoint yet, so clients must log in again after refresh-token expiry or after access-token expiry if no refresh flow is added.

## Migration Notes

- Startup applies migrations in `backend/pkg/db/migrations` using the `schema_migrations` table.
- Existing databases with legacy string-based `users.id` values are upgraded to UUIDs using shadow columns and transactional swaps.
- Legacy IDs that already contain UUID strings are preserved; non-UUID legacy IDs are remapped to fresh UUIDs and dependent `refresh_tokens.user_id` / `expenses.user_id` values are updated in the same transaction.
- If a child row cannot be mapped to a user during migration, startup fails fast instead of partially mutating the schema.
- Back up local or shared PostgreSQL data before first running the upgraded server against an older database.

## Suggested Extension Rules

When adding new backend endpoints:

- keep all JSON responses inside the shared success/error envelope
- document new status codes and error codes as part of the endpoint change
- decide explicitly whether an endpoint expects an access token or a refresh token
- keep validation failures as `400`
- keep authentication failures as `401`
- use `409` only for real conflict states such as duplicate resources
