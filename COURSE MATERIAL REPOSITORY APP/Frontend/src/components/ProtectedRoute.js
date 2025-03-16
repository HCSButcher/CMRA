import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        return <Navigate to='/login ' />;
    }
    return < Outlet />;
};

export default ProtectedRoute;
