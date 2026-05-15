import { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  removeStoredUser,
} from "../lib/api";
// context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

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
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData);
    // optionally persist to localStorage
    // localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
}
