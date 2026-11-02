import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading)
    return (
      <div className="auth-loading" role="status">
        Checking your session…
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === "TENANT" ? "/tenant/dashboard" : "/admin/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}

export function HomeRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading)
    return (
      <div className="auth-loading" role="status">
        Checking your session…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={user.role === "TENANT" ? "/tenant/dashboard" : "/admin/dashboard"}
      replace
    />
  );
}
