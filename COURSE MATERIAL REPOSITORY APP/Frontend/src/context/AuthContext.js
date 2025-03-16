import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchUser = async () => {
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
      console.error("Error fetching user:", err);

      if (err.response?.status === 401) {
        console.log("Token expired, trying refresh...");

        try {
          const refreshRes = await axios.post("http://localhost:3001/auth/refresh", {}, { withCredentials: true });

          if (refreshRes.data?.token) {
            localStorage.setItem("token", refreshRes.data.token);
            return fetchUser(); // Retry fetching user with new token
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          localStorage.removeItem("token");
        }
      }

      setUser(null);
    }

    setLoading(false);
  };

  fetchUser();
}, []);


  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
  };

  const logout = async () => {
    try {
        await axios.get("http://localhost:3001/logout", { withCredentials: true });

        
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        console.log("Logout successful");
    } catch (error) {
        console.error("Logout error:", error);
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
