import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Using logout function from AuthContext

  const handleLogout = async () => {
    try {
        const response = await fetch("https://project-2-1u71.onrender.com/logout", { 
            method: "GET", 
            credentials: "include",  
        });

        if (!response.ok) {
            throw new Error(`Logout failed: ${response.statusText}`);
        }

        // ✅ Ensure local storage is cleared
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");

        // ✅ Redirect user to login page
        navigate("/login");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

  return (
    <>
      <style>
        {`
          .btn-1 {
            background-color: #f05462;
            width: 80px;
            height: 40px; 
            text-align: center;  
            color: white;
            border: none;
            cursor: pointer;
            font-size: 14px;
            border-radius: 5px;
            transition: background-color 0.3s ease-in-out;
          }

          .btn-1:hover {
            background-color: white;
            color: #f05462;
            border: 1px solid #f05462;
          }
        `}
      </style>
      <button className="btn-1" onClick={handleLogout}>Log out</button>
    </>
  );
};

export default LogoutButton;
