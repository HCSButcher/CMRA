import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userEmail");
        const storedRole = localStorage.getItem("userRole");

        console.log("🔍 Checking LocalStorage:", { storedToken, storedUser, storedRole });

        if (storedToken && storedUser && storedRole) {
            setToken(storedToken);
            setUser({ email: storedUser, role: storedRole });
        }
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        console.log("🔴 Logging out user...");
        setUser(null);
        setToken(null);
        localStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
