import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

function GoogleAuthCallback() {
  const navigate = useNavigate();
  const { storeSession } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const error = params.get("error");

    if (error || !code) {
      navigate("/auth/login?error=google_cancelled");
      return;
    }

    const storedState = sessionStorage.getItem("google_oauth_state");
    const codeVerifier = sessionStorage.getItem("google_code_verifier");

    if (!storedState || state !== storedState || !codeVerifier) {
      navigate("/auth/login?error=invalid_state");
      return;
    }

    sessionStorage.removeItem("google_oauth_state");
    sessionStorage.removeItem("google_code_verifier");

    const redirectUri = `${window.location.origin}/auth/google/callback`;

    authApi
      .googleCallback({ code, code_verifier: codeVerifier, redirect_uri: redirectUri, state })
      .then((data) => {
        storeSession(data);
        navigate("/dashboard");
      })
      .catch(() => {
        navigate("/auth/login?error=google_failed");
      });
  }, [navigate, storeSession]);

  return (
    <div className="auth-callback-loading">
      <p>Completing sign-in…</p>
    </div>
  );
}

export default GoogleAuthCallback;
