import { Outlet } from "react-router-dom";
import handImage from "/hand.png";

function AuthLayout() {
  return (
    <div className="auth-root">
      <div className="auth-left">
        <a className="auth-logo" href="#">
          <span className="logo-icon">B</span>
          <span className="logo-text">Budgeet</span>
        </a>
        <main className="auth-form-area">
        <Outlet />
        </main>
      </div>
      
      <div className="auth-right">
        <div className="panel-hand">
          <img src={handImage} alt="finance illustration" />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
