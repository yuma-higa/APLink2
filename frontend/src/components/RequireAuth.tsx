import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("accessToken");
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}