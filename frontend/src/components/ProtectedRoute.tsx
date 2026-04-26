import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  role: UserRole;
}

export function ProtectedRoute({ children, role }: Props) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    const redirectionUrl = user.role === "admin" ? "/admin" : "/home";
    return <Navigate to={redirectionUrl} replace />;
  }

  return <>{children}</>;
}
