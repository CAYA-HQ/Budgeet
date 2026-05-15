import requests as http_requests
from django.conf import settings
from django.contrib.auth import get_user_model, authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from core.emails import send_welcome_email

User = get_user_model()


def _token_for_user(user):
    """Return a JWT access token string for the given user."""
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


# ─── Register ─────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register/
    Body: { name, email, password }
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        # Return the first error message as a flat string so the frontend
        # can display it directly via data.message
        first_error = next(iter(serializer.errors.values()))[0]
        return Response({"message": str(first_error)}, status=status.HTTP_400_BAD_REQUEST)

    user = serializer.save()
    send_welcome_email(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "token": _token_for_user(user),
        },
        status=status.HTTP_201_CREATED,
    )


# ─── Login ────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login/
    Body: { email, password }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"message": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response(
            {"message": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"message": "This account has been deactivated."},
            status=status.HTTP_403_FORBIDDEN,
        )

    return Response(
        {
            "user": UserSerializer(user).data,
            "token": _token_for_user(user),
        }
    )


# ─── Google OAuth ─────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def google_auth(request):
    """
    POST /api/auth/google/
    Body: { code, code_verifier, redirect_uri, state }

    Exchanges the Google authorisation code for an ID token, upserts the
    user, and returns the same { user, token } shape as register/login.
    """
    code = request.data.get("code")
    code_verifier = request.data.get("code_verifier")
    redirect_uri = request.data.get("redirect_uri")

    print(f"\n[Google OAuth] Incoming data:")
    print(f"  code         = {'YES len=' + str(len(code)) if code else 'MISSING'}")
    print(f"  code_verifier= {'YES len=' + str(len(code_verifier)) if code_verifier else 'MISSING'}")
    print(f"  redirect_uri = {redirect_uri or 'MISSING'}")

    if not all([code, code_verifier, redirect_uri]):
        print(f"[Google OAuth] FAIL: missing required fields")
        return Response(
            {"message": "code, code_verifier and redirect_uri are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    client_id = settings.GOOGLE_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET

    if not client_id or not client_secret:
        return Response(
            {"message": "Google OAuth is not configured on this server."},
            status=status.HTTP_501_NOT_IMPLEMENTED,
        )

    # Exchange code for tokens
    print(f"\n[Google OAuth] Exchanging code...")
    print(f"[Google OAuth] redirect_uri = {redirect_uri}")

    token_resp = http_requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
            "code_verifier": code_verifier,
        },
        timeout=10,
    )

    print(f"[Google OAuth] Token exchange status: {token_resp.status_code}")
    print(f"[Google OAuth] Token exchange response: {token_resp.json()}")

    if token_resp.status_code != 200:
        return Response(
            {"message": "Failed to exchange Google code for tokens."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    google_tokens = token_resp.json()
    id_token = google_tokens.get("id_token")

    # Verify / decode the ID token via Google's tokeninfo endpoint
    info_resp = http_requests.get(
        "https://oauth2.googleapis.com/tokeninfo",
        params={"id_token": id_token},
        timeout=10,
    )

    print(f"[Google OAuth] Token info status: {info_resp.status_code}")
    print(f"[Google OAuth] Token info response: {info_resp.json()}")

    if info_resp.status_code != 200:
        return Response(
            {"message": "Unable to verify Google identity token."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    info = info_resp.json()
    email = info.get("email")
    name = info.get("name", email)
    avatar = info.get("picture", "")

    if not email:
        return Response(
            {"message": "Google account does not have a verified email."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user, created = User.objects.get_or_create(
        email=email,
        defaults={"name": name, "avatar": avatar},
    )
    if created:
        # New user — send welcome email
        send_welcome_email(user)
    elif avatar:
        # Returning user — keep avatar fresh
        User.objects.filter(pk=user.pk).update(avatar=avatar)
        user.avatar = avatar

    return Response(
        {
            "user": UserSerializer(user).data,
            "token": _token_for_user(user),
        },
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


# ─── Me (profile) ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    """GET /api/auth/me/  — returns the authenticated user's profile."""
    return Response(UserSerializer(request.user).data)