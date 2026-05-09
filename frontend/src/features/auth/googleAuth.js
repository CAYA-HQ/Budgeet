const STORAGE_KEY = "budgeet_google_auth";

function base64UrlEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  return await window.crypto.subtle.digest("SHA-256", data);
}

function generateRandomString(length = 128) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => String.fromCharCode(33 + (byte % 94))).join("");
}

export function getGoogleRedirectUri() {
  return `${window.location.origin}/auth/google/callback`;
}

export function getGoogleBackendUrl() {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  return `${base.replace(/\/$/, "")}/api/auth/google/`;
}

export async function startGoogleAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("VITE_GOOGLE_CLIENT_ID is required for Google sign-in.");
  }

  const codeVerifier = generateRandomString(128);
  const codeChallengeBuffer = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(codeChallengeBuffer);
  const state = generateRandomString(16);

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ codeVerifier, state, createdAt: Date.now() })
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function loadGoogleAuthData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearGoogleAuthData() {
  sessionStorage.removeItem(STORAGE_KEY);
}
