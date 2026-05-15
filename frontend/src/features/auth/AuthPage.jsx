// import { useState, useCallback, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { startGoogleAuth } from "./googleAuth";
// import "./AuthPage.css";
// import handImage from "/hand.png";
// import SignIn from "./SignIn";
// import SignUp from "./SignUp";

// const COIN_SVG = (
//   <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
//     <defs>
//       <radialGradient id="coinGrad" cx="38%" cy="32%" r="65%">
//         <stop offset="0%" stopColor="#FFE082" />
//         <stop offset="40%" stopColor="#FFB300" />
//         <stop offset="100%" stopColor="#8B6000" />
//       </radialGradient>
//       <radialGradient id="coinFace" cx="40%" cy="35%" r="60%">
//         <stop offset="0%" stopColor="#FFD54F" />
//         <stop offset="100%" stopColor="#F9A825" />
//       </radialGradient>
//       <filter id="glow">
//         <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
//         <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
//       </filter>
//     </defs>
//     <circle cx="55" cy="57" r="46" fill="#8B6000" opacity="0.3" />
//     <circle cx="55" cy="55" r="46" fill="url(#coinGrad)" />
//     <circle cx="55" cy="55" r="39" fill="url(#coinFace)" />
//     <circle cx="55" cy="55" r="39" fill="none" stroke="#FFE082" strokeWidth="1.5" opacity="0.5" />
//     <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#7B4F00" fontFamily="serif">₦</text>
//     <rect x="42" y="57" width="26" height="3" rx="1.5" fill="#7B4F00" opacity="0.7"/>
//     <rect x="42" y="63" width="26" height="3" rx="1.5" fill="#7B4F00" opacity="0.5"/>
//     <circle cx="75" cy="25" r="5" fill="white" opacity="0.7" filter="url(#glow)" />
//     <circle cx="80" cy="32" r="2.5" fill="white" opacity="0.5" />
//   </svg>
// );


export default function BudgeetAuth() {
  const location = useLocation();
  // const [page, setPage] = useState("signup");
  // const [page, setPage] = useState(location.state?.screen || "signup");

  useEffect(() => {
    if (location.state?.screen) {
      setPage(location.state.screen);
    }
  }, [location.state]);

  return (
    <>
      <div className="auth-root">
        {/* Left */}
        <div className="auth-left">
          {/* <a className="auth-logo" href="#">
            <span className="logo-icon">B</span>
            <span className="logo-text">Budgeet</span>
          </a> */}
          {/* <div className="auth-form-area">
            {page === "signup"
              ? <SignUp onSwitch={() => setPage("signin")} />
              : <SignIn onSwitch={() => setPage("signup")} />
            }
          </div> */}
        </div>

        {/* Right */}
        {/* <div className="auth-right">
            <div className="panel-hand">
                <img src={handImage} alt="finance illustration" />
            </div>
        </div> */}
      </div>
    </>
  );
}