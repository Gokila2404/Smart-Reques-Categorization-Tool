import { createContext, useState } from "react";

export const AuthContext = createContext();
const AUTH_KEY = "auth";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const sessionStored = sessionStorage.getItem(AUTH_KEY);
    if (sessionStored) return JSON.parse(sessionStored);

    const legacyLocal = localStorage.getItem(AUTH_KEY);
    if (legacyLocal) {
      sessionStorage.setItem(AUTH_KEY, legacyLocal);
      localStorage.removeItem(AUTH_KEY);
      return JSON.parse(legacyLocal);
    }

    return null;
  });

  const login = (data) => {
    setAuth(data);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(data));
    localStorage.removeItem(AUTH_KEY);
  };

  const logout = () => {
    setAuth(null);
    sessionStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
