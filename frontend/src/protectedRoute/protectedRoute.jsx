import React from "react";
import { Navigate } from "react-router-dom";

const Protected = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "hospital") {
      return <Navigate to="/hospitaldashboard" replace />;
    }
    if (user.role === "user") {
      return <Navigate to="/userdashboard" replace />;
    }

    return <Navigate to="/home" replace />;
  }

  return children;
};

export default Protected;
