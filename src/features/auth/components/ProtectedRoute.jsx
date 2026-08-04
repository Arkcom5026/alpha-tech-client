// ✅ src/features/auth/components/ProtectedRoute.jsx

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { traceRouteGuard } from '@/utils/authTrace';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const accessToken = useAuthStore((state) => state.accessToken || state.token || null);
  const authChecked = useAuthStore((state) => state.authChecked);
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const authBootstrapState = useAuthStore((state) => state.authBootstrapState);
  const role = useAuthStore((state) => state.role);
  const location = useLocation();

  const isAuthenticated = Boolean(accessToken) && Boolean(authChecked) && !isBootstrappingAuth;

  traceRouteGuard({
    accessToken,
    token: accessToken,
    authChecked,
    isBootstrappingAuth,
    authBootstrapState,
    role,
  });

  // Bootstrap is still resolving. Rendering nothing preserves the requested URL
  // and prevents a transient redirect to /login after a successful refresh/me flow.
  const bootstrapPending =
    isBootstrappingAuth ||
    authBootstrapState === 'loading' ||
    (!authChecked && authBootstrapState === 'idle') ||
    (Boolean(accessToken) && !authChecked);

  if (bootstrapPending) return null;

  // Redirect only after authentication has reached a terminal unauthenticated state.
  if (!isAuthenticated) {
    if (location.pathname === '/login') return null;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
