const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

function randomString(length = 64) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function startGoogleAuth() {
  const state = randomString(32);
  const codeVerifier = randomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem("google_oauth_state", state);
  sessionStorage.setItem("google_code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}
