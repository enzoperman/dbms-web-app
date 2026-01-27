import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("coerts_token"));

  useEffect(() => {
    if (!token) return;
    api
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setUser(res.data.user))
      .catch(() => logout());
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    setToken(res.data.token);
    localStorage.setItem("coerts_token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("coerts_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
