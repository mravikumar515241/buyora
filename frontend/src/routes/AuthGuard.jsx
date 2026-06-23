import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AuthGuard({ children, allowedRoles }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && user?.roles) {
    const hasRole = allowedRoles.some((r) => user.roles.includes(r));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

/** Alias for route protection; use AuthGuard for role-based access. */
export const ProtectedRoute = AuthGuard;
