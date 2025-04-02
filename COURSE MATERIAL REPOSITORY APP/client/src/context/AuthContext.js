import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const verifyToken = async () => {
            const storedToken = localStorage.getItem("token");
            if (!storedToken) {
                console.log(" No token found, logging out...");
                setLoading(false);
                return logout();
            }

            try {
                console.log("🔹 Verifying token with backend...");
                const response = await axios.get("http://10.1.33.99:3001/auth/verify", {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });

                console.log(" Token verified:", response.data);
                setUser(response.data.user);
                setToken(storedToken);
            } catch (error) {
                console.error(" Token verification failed, logging out...");
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = (userData, authToken) => {
        console.log(" Logging in...");
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

    const logout = () => {
        console.log("🔹 Logging out...");
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children} {/* Prevents rendering until auth check completes */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
