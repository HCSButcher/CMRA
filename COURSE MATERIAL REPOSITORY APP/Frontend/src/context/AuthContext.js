import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    let token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:3001/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (!res.data || typeof res.data !== "object") {
        throw new Error("Invalid response from server");
      }

      setUser(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const refreshRes = await axios.post("http://localhost:3001/auth/refresh", {}, { withCredentials: true });

          if (refreshRes.data?.token) {
            localStorage.setItem("token", refreshRes.data.token);
            return fetchUser();
          }
        } catch {
          localStorage.removeItem("token");
        }
      }

      setUser(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (userData, token) => {
    localStorage.setItem("token", token);
    setUser(null);

    try {
      await fetchUser();
    } catch {}
  };

  const logout = async () => {
    try {
      await axios.get("http://localhost:3001/logout", { withCredentials: true });

      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
