import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Renders children only when user is NOT logged in.
 * If logged in, redirects to the page they came from or home.
 */
export function GuestGuard({ children }) {
  const token = useAuthStore((s) => s.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
