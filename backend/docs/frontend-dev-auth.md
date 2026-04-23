# Frontend Auth Integration Notes

This document is for frontend developers consuming the current backend auth API.

## Base Paths

Current routes:

- health check: `GET /health`
- auth base: `/api/v1/auth`

Examples:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`

## Response Shape

Every successful JSON response follows:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Every failed JSON response follows:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable explanation"
  }
}
```

Frontend code should branch on HTTP status and `error.code`, not only on `error.message`.

## Register

Endpoint:

```http
POST /api/v1/auth/register
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "strongpass123"
}
```

Success:

- Status: `201`

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

Expected error cases:

- `400 VALIDATION_ERROR`
- `409 EMAIL_ALREADY_EXISTS`
- `500 INTERNAL_ERROR`

What `VALIDATION_ERROR` can mean here:

- invalid JSON body
- missing `email`
- missing `password`
- invalid email format
- password shorter than 8 characters

## Login

Endpoint:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "strongpass123"
}
```

Success:

- Status: `200`

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

Expected error cases:

- `400 VALIDATION_ERROR`
- `401 INVALID_CREDENTIALS`
- `500 INTERNAL_ERROR`

Important expectation:

- login does not currently validate email format separately
- a wrong email or wrong password both return `401 INVALID_CREDENTIALS`

Treat that as a generic authentication failure in the UI.

## Logout

Endpoint:

```http
POST /api/v1/auth/logout
Authorization: Bearer <refresh-token>
```

Success:

- Status: `204`
- Body: empty

Expected error cases:

- `401 UNAUTHORIZED`
- `500 INTERNAL_ERROR`

Important expectation:

- this endpoint expects the refresh token in the `Authorization` header
- do not send the access token if the goal is logout/revocation

Because the response is `204 No Content`, frontend code should not try to parse JSON on success.

## Token Handling Expectations

Current token behavior from the backend:

- access token lifetime is `15 minutes`
- refresh token lifetime is `7 days`
- register and login both return both tokens immediately
- there is no refresh endpoint yet

That means the frontend should currently expect one of these strategies:

- keep the user signed in only until the access token expires, then force login again
- or hold the refresh token for later use once a refresh endpoint exists

At the moment, logout revokes the refresh token, but there is no API route to exchange a refresh token for a new access token.

## Error Handling Recommendations

Recommended frontend mapping:

- `VALIDATION_ERROR`: show inline form errors or a generic invalid-input message
- `EMAIL_ALREADY_EXISTS`: show that the email is already registered
- `INVALID_CREDENTIALS`: show a generic login failure message
- `UNAUTHORIZED`: treat as missing/invalid/expired token and clear auth state if needed
- `INTERNAL_ERROR`: show a generic fallback and optionally allow retry

## Safe Client Assumptions

Frontend code should assume:

- `success` is always present
- `data` is present on JSON success responses
- `error.code` and `error.message` are present on JSON error responses
- logout success has no JSON body

Frontend code should not assume:

- that all `401` responses mean the same thing
- that the backend exposes field-level validation details
- that refresh token exchange already exists

## Suggested UI Copy Behavior

Use backend `error.code` for control flow, then map to product copy in the client.

Examples:

- `EMAIL_ALREADY_EXISTS` -> `An account with this email already exists.`
- `INVALID_CREDENTIALS` -> `Email or password is incorrect.`
- `UNAUTHORIZED` -> `Your session is no longer valid. Please sign in again.`
- `INTERNAL_ERROR` -> `Something went wrong. Please try again.`

Avoid displaying raw backend `message` values directly as the only UX copy layer unless that is a deliberate product decision.
