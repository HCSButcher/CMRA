import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;  // ✅ Prevent redirect before check

  console.log("🔍 Checking ProtectedRoute:", { user, allowedRoles });
  console.log("🔍 Role comparison:", allowedRoles?.includes(user?.role?.trim()), "User Role:", user?.role, "Allowed Roles:", allowedRoles);

  if (!user) {
    console.log("🚨 No user found, redirecting...");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role?.trim())) {
    console.log(`⛔ Role '${user.role}' is not allowed, redirecting...`);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;