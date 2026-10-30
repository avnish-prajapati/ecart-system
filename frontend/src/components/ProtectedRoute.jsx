// ← a guard for PAGES (like verifyToken + isAdmin on the backend)
//   <ProtectedRoute>                -> any logged-in person
//   <ProtectedRoute role="admin">   -> only admin

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  // not logged in -> go to login
  if (!user) return <Navigate to="/login" replace />;

  // logged in but wrong role -> go home (home sends you to the right side)
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
