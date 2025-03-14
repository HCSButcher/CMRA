import React from 'react'
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3001/logout', { 
                method: 'GET', 
                credentials: 'include' 
            });

            // Clear stored authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');

            // Redirect user to login page
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    return (
        <>
            <style>
                {`
                 
               .btn-1 {
                 background-color:#f05462;
                 width:50px;
                 height:60px; 
              text-align: center;           
                }
                 
                 button:hover {
                  background-color:white;
                 }
                `}

    </style>
        <button className ='btn-1' onClick={handleLogout} >Log out </button>
        </>
    )
}

export default LogoutButton
