import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { startGoogleAuth } from "./googleAuth";
import { useAuth } from "../../context/AuthContext";

const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

export function SignUp({ onSwitch }) {
  const navigate = useNavigate();
  const { storeSession } = useAuth();
 
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
 
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };
 
  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: "" }));
    setApiError("");
  };
 
  const handleGoogleButton = useCallback(async () => {
    setApiError("");
    try {
      await startGoogleAuth();
    } catch (err) {
      setApiError(err?.message || "Google sign-in is unavailable.");
    }
  }, []);
 
  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
 
      const data = await res.json();
      if (!res.ok) {
        setApiError(data?.message || "Registration failed");
        return;
      }
 
      // Save token + user to localStorage so PrivateRoute lets us through
      storeSession(data);
      setSuccess(true);
      navigate("/dashboard");
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <div className="success-screen form-enter">
        <div className="success-icon">✓</div>
        <div className="success-title">Account created!</div>
        <div className="success-msg">
          Welcome to Budgeet, {form.name.split(" ")[0]}. You're all set.
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: 8, width: "auto", padding: "12px 32px" }}
          onClick={() => {
            setSuccess(false);
            // onSwitch();
          }}
        >
          Sign in now
        </button>
      </div>
    );

  return (
    <div className="form-enter">
      <h1 className="auth-heading">Create new account</h1>
      <p className="auth-sub">Welcome back! Please enter your details</p>

      {apiError && <div className="global-error">{apiError}</div>}

      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div className="input-wrap">
          <input
            className={`form-input${errors.name ? " error-field" : ""}`}
            type="text"
            placeholder="Adaeze Okafor"
            value={form.name}
            onChange={handleChange("name")}
            autoComplete="name"
          />
        </div>
        {errors.name && <div className="field-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <div className="input-wrap">
          <input
            className={`form-input${errors.email ? " error-field" : ""}`}
            type="email"
            placeholder="adaezeokafor100@gmail.com"
            value={form.email}
            onChange={handleChange("email")}
            autoComplete="email"
          />
        </div>
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-wrap">
          <input
            className={`form-input has-toggle${errors.password ? " error-field" : ""}`}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange("password")}
            autoComplete="new-password"
          />
          <button
            className="pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            type="button"
            tabIndex={-1}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>
        {errors.password && (
          <div className="field-error">{errors.password}</div>
        )}
      </div>

      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 6 }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </button>
      <button className="btn-google" type="button" onClick={handleGoogleButton}>
        <GoogleIcon /> Sign up with google
      </button>
      <div className="auth-footer">
        Already have an account?{" "}
        <a onClick={() => navigate("/auth/signin")}>Sign in</a>
      </div>
    </div>
  );
}

export default SignUp;
