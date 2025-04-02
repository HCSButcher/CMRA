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
                setLoading(false);
                return logout();
            }

            try {               
                const response = await axios.get("http://localhost:3001/auth/verify", {
                    headers: { Authorization: `Bearer ${storedToken}` }
                });                
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
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("token", authToken);
    };

    const logout = () => {       
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
