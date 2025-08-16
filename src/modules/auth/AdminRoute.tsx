// src/modules/auth/AdminRoute.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useIsAdmin } from "./useIsAdmin";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (!user && !loading) return <Navigate to="/signin" replace />;

  if (loading || adminLoading) {
    return <div className="p-6 text-sm">Checking admin permission…</div>;
  }

  if (user && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user && user.emailVerified && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
