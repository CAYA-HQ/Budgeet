import { useState } from "react";
import handImage from "./assets/hand.png";

const COIN_SVG = (
  <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="coinGrad" cx="38%" cy="32%" r="65%">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="40%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#8B6000" />
      </radialGradient>
      <radialGradient id="coinFace" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#FFD54F" />
        <stop offset="100%" stopColor="#F9A825" />
      </radialGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <circle cx="55" cy="57" r="46" fill="#8B6000" opacity="0.3" />
    <circle cx="55" cy="55" r="46" fill="url(#coinGrad)" />
    <circle cx="55" cy="55" r="39" fill="url(#coinFace)" />
    <circle cx="55" cy="55" r="39" fill="none" stroke="#FFE082" strokeWidth="1.5" opacity="0.5" />
    <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#7B4F00" fontFamily="serif">₦</text>
    <rect x="42" y="57" width="26" height="3" rx="1.5" fill="#7B4F00" opacity="0.7"/>
    <rect x="42" y="63" width="26" height="3" rx="1.5" fill="#7B4F00" opacity="0.5"/>
    <circle cx="75" cy="25" r="5" fill="white" opacity="0.7" filter="url(#glow)" />
    <circle cx="80" cy="32" r="2.5" fill="white" opacity="0.5" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue: #1B2FE8;
    --blue-hover: #1526C9;
    --blue-bg: #EEF0FD;
    --text: #0F1117;
    --sub: #6B7280;
    --border: #E5E7EB;
    --white: #FFFFFF;
    --panel-bg: #E8EAF6;
    --input-bg: #F9FAFB;
    --error: #DC2626;
    --radius: 10px;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--white); }

  .auth-root {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
  }

  /* Left panel */
  .auth-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 32px 48px 40px;
    min-height: 100vh;
    background: var(--white);
    position: relative;
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 0;
    text-decoration: none;
  }
  .logo-icon {
    width: 36px; height: 36px;
    background: var(--blue);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 700;
    font-size: 18px;
    letter-spacing: -0.5px;
    flex-shrink: 0;
  }
  .logo-text {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: var(--text);
    letter-spacing: -0.3px;
  }

  .auth-form-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 0;
  }

  .auth-heading {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: -0.8px;
    margin-bottom: 6px;
    line-height: 1.15;
  }
  .auth-sub {
    font-size: 14px;
    color: var(--sub);
    margin-bottom: 32px;
    font-weight: 400;
  }

  .form-group { margin-bottom: 18px; }
  .form-label {
    display: block;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text);
    margin-bottom: 7px;
    letter-spacing: -0.1px;
  }

  .input-wrap { position: relative; }
  .form-input {
    width: 100%;
    padding: 12px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    background: var(--input-bg);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none;
  }
  .form-input::placeholder { color: #B0B7C3; }
  .form-input:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(27,47,232,0.08);
    background: var(--white);
  }
  .form-input.error-field { border-color: var(--error); }
  .form-input.has-toggle { padding-right: 44px; }

  .pw-toggle {
    position: absolute;
    right: 13px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    cursor: pointer; padding: 2px;
    color: var(--sub);
    display: flex; align-items: center;
    transition: color 0.15s;
  }
  .pw-toggle:hover { color: var(--blue); }

  .field-error {
    margin-top: 5px;
    font-size: 12px;
    color: var(--error);
    font-weight: 400;
  }

  .form-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }
  .checkbox-label {
    display: flex; align-items: center; gap: 7px;
    font-size: 13px; color: var(--sub);
    cursor: pointer; user-select: none;
  }
  .checkbox-label input[type="checkbox"] {
    width: 15px; height: 15px;
    accent-color: var(--blue);
    cursor: pointer;
  }
  .forgot-link {
    font-size: 13px;
    color: var(--blue);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }
  .forgot-link:hover { opacity: 0.7; }

  .btn-primary {
    width: 100%;
    padding: 13px;
    background: var(--blue);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: -0.1px;
    transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--blue-hover);
    box-shadow: 0 4px 16px rgba(27,47,232,0.25);
  }
  .btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

  .btn-google {
    width: 100%;
    padding: 12px;
    background: var(--white);
    color: var(--text);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.15s, border-color 0.15s;
    letter-spacing: -0.1px;
  }
  .btn-google:hover { background: #F5F7FF; border-color: #C7CCFA; }

  .auth-footer {
    text-align: center;
    margin-top: 22px;
    font-size: 13.5px;
    color: var(--sub);
  }
  .auth-footer a {
    color: var(--text);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
  .auth-footer a:hover { color: var(--blue); }

  .global-error {
    background: #FEF2F2;
    border: 1px solid #FECACA;
    color: var(--error);
    border-radius: var(--radius);
    padding: 11px 14px;
    font-size: 13.5px;
    margin-bottom: 18px;
  }

  .success-screen {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; text-align: center; padding: 40px 0;
  }
  .success-icon {
    width: 56px; height: 56px;
    background: #ECFDF5; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #10B981; font-size: 26px;
  }
  .success-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 22px; font-weight: 700;
    color: var(--text); letter-spacing: -0.5px;
  }
  .success-msg { font-size: 14px; color: var(--sub); }

  .auth-right {
  flex: 1;                           /* Takes 50% of parent width */
  background: var(--panel-bg);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;             /* Align image to bottom */
  justify-content: flex-end;         /* Align image to right side */
}

.panel-hand {
  position: relative;
  width: 46vw;                       
  max-width: 660px;                  
  margin-right: 0;                   
  margin-bottom: -10px;              
  display: flex;
  justify-content: flex-end;
}

.panel-hand img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
  animation: floatImage 3s ease-in-out infinite;
}


  .panel-coin {
    position: absolute;
    top: 14%;
    right: 12%;
    animation: coinFloat 3.5s ease-in-out infinite;
    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.22));
    user-select: none;
  }

  @keyframes coinFloat {
    0%, 100% { transform: translateY(0px) rotate(-3deg); }
    50% { transform: translateY(-10px) rotate(3deg); }
  }

  .spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block; vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Form enter animation */
  .form-enter { animation: fadeUp 0.38s ease both; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Responsive */
  @media (max-width: 820px) {
    .auth-right { display: none; }
    .auth-left { padding: 28px 24px 32px; }
    .auth-form-area { padding: 24px 0; }
  }
  @media (max-width: 480px) {
    .auth-heading { font-size: 26px; }
  }
`;

function SignUp({ onSwitch }) {
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

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiError("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password
        })
        });

        if (!res.ok) {
      setApiError(data.message || "Registration failed");
      return;
    }

      setSuccess(true);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="success-screen form-enter">
      <div className="success-icon">✓</div>
      <div className="success-title">Account created!</div>
      <div className="success-msg">Welcome to Budgeet, {form.name.split(" ")[0]}. You're all set.</div>
      <button className="btn-primary" style={{marginTop:8,width:'auto',padding:'12px 32px'}} onClick={() => { setSuccess(false); onSwitch(); }}>Sign in now</button>
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
          <input className={`form-input${errors.name ? " error-field" : ""}`}
            type="text" placeholder="Adaeze Okafor"
            value={form.name} onChange={handleChange("name")} autoComplete="name" />
        </div>
        {errors.name && <div className="field-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <div className="input-wrap">
          <input className={`form-input${errors.email ? " error-field" : ""}`}
            type="email" placeholder="adaezeokafor100@gmail.com"
            value={form.email} onChange={handleChange("email")} autoComplete="email" />
        </div>
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-wrap">
          <input className={`form-input has-toggle${errors.password ? " error-field" : ""}`}
            type={showPw ? "text" : "password"} placeholder="••••••••"
            value={form.password} onChange={handleChange("password")} autoComplete="new-password" />
          <button className="pw-toggle" onClick={() => setShowPw(v => !v)} type="button" tabIndex={-1}>
            <EyeIcon open={showPw} />
          </button>
        </div>
        {errors.password && <div className="field-error">{errors.password}</div>}
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{marginTop:6}}>
        {loading ? <><span className="spinner"/>Creating account…</> : "Create Account"}
      </button>
      <button className="btn-google" type="button">
        <GoogleIcon /> Sign up with google
      </button>
      <div className="auth-footer">
        Already have an account? <a onClick={onSwitch}>Sign in</a>
      </div>
    </div>
  );
}

function SignIn({ onSwitch }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: "" }));
    setApiError("");
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiError("");
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
            });

        const data = await res.json();
        console.log(data); // should contain token
      setSuccess(true);
    } catch {
      setApiError("Invalid email or password. Please try again.");
    } finally { setLoading(false); }
  };

  if (success) return (
    <div className="success-screen form-enter">
      <div className="success-icon">✓</div>
      <div className="success-title">Signed in!</div>
      <div className="success-msg">Welcome back. Redirecting to your dashboard…</div>
    </div>
  );

  return (
    <div className="form-enter">
      <h1 className="auth-heading">Welcome back</h1>
      <p className="auth-sub">Welcome back! Please enter your details</p>

      {apiError && <div className="global-error">{apiError}</div>}

      <div className="form-group">
        <label className="form-label">Email</label>
        <div className="input-wrap">
          <input className={`form-input${errors.email ? " error-field" : ""}`}
            type="email" placeholder="Enter your email"
            value={form.email} onChange={handleChange("email")} autoComplete="email" />
        </div>
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="input-wrap">
          <input className={`form-input has-toggle${errors.password ? " error-field" : ""}`}
            type={showPw ? "text" : "password"} placeholder="••••••••"
            value={form.password} onChange={handleChange("password")} autoComplete="current-password" />
          <button className="pw-toggle" onClick={() => setShowPw(v => !v)} type="button" tabIndex={-1}>
            <EyeIcon open={showPw} />
          </button>
        </div>
        {errors.password && <div className="field-error">{errors.password}</div>}
      </div>

      <div className="form-row">
        <label className="checkbox-label">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Remember for 30 Days
        </label>
        <a href="#" className="forgot-link">Forgot password</a>
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <><span className="spinner"/>Signing in…</> : "Sign in"}
      </button>
      <button className="btn-google" type="button">
        <GoogleIcon /> Sign in with google
      </button>
      <div className="auth-footer">
        Don't have an account? <a onClick={onSwitch}>Sign up for free</a>
      </div>
    </div>
  );
}

export default function BudgeetAuth() {
  const [page, setPage] = useState("signup");

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        {/* Left */}
        <div className="auth-left">
          <a className="auth-logo" href="#">
            <span className="logo-icon">B</span>
            <span className="logo-text">Budgeet</span>
          </a>
          <div className="auth-form-area">
            {page === "signup"
              ? <SignUp onSwitch={() => setPage("signin")} />
              : <SignIn onSwitch={() => setPage("signup")} />
            }
          </div>
        </div>

        {/* Right */}
        <div className="auth-right">
            <div className="panel-hand">
                <img src={handImage} alt="finance illustration" />
            </div>
        </div>
      </div>
    </>
  );
}
