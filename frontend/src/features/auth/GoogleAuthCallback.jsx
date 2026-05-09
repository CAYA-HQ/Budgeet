import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearGoogleAuthData,
  getGoogleBackendUrl,
  getGoogleRedirectUri,
  loadGoogleAuthData,
} from "./googleAuth";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing Google sign-in...");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolveGoogleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const errorParam = params.get("error");
      const returnedState = params.get("state");

      if (errorParam) {
        setError(`Google authentication failed: ${errorParam}`);
        setMessage(null);
        return;
      }

      if (!code) {
        setError("Google did not return an authorization code.");
        setMessage(null);
        return;
      }

      const authData = loadGoogleAuthData();
      if (!authData || !authData.codeVerifier) {
        setError("Unable to complete sign-in. Please try again.");
        setMessage(null);
        return;
      }

      if (authData.state && returnedState !== authData.state) {
        setError("Invalid sign-in state. Please try again.");
        setMessage(null);
        return;
      }

      try {
        const res = await fetch(getGoogleBackendUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            code_verifier: authData.codeVerifier,
            redirect_uri: getGoogleRedirectUri(),
            state: authData.state,
          }),
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Google sign-in failed.");
          setMessage(null);
          return;
        }

        clearGoogleAuthData();
        navigate("/dashboard");
      } catch (err) {
        console.error(err);
        setError("Unable to complete Google sign-in at this time.");
        setMessage(null);
      }
    }

    resolveGoogleCallback();
  }, [navigate]);

  return (
    <div className="auth-root" style={{ justifyContent: "center", padding: "40px" }}>
      <div className="auth-form-area" style={{ maxWidth: "520px", width: "100%" }}>
        <div className="success-screen form-enter" style={{ padding: "32px", background: "white", borderRadius: "16px", boxShadow: "0 18px 40px rgba(15,17,23,0.08)" }}>
          <div className="success-title">Google sign-in</div>
          {message && <p style={{ color: "#4B5563" }}>{message}</p>}
          {error && <div className="global-error" style={{ marginTop: "16px" }}>{error}</div>}
          {error && (
            <button className="btn-primary" style={{ width: "auto", padding: "12px 28px", marginTop: "18px" }} onClick={() => navigate("/auth")}>Return to sign in</button>
          )}
        </div>
      </div>
    </div>
  );
}
