import { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  /** Called after a successful register or login API response. */
  const storeSession = ({ user: userData, token }) => {
    setToken(token);
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    removeStoredUser();
    setUser(null);
  };

  const isAuthenticated = Boolean(user && getToken());

  return (
    <AuthContext.Provider
      value={{ user, storeSession, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

