

// ✅ src/features/auth/components/ProtectedRoute.jsx


import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticatedSelector?.());
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const role = useAuthStore((state) => state.role);
  const token = useAuthStore((state) => state.token);

  // ✅ ระหว่างกำลัง bootstrap session อยู่ ยังไม่รีบ redirect
  if (isBootstrappingAuth) {
    return null;
  }

  // ✅ ถ้ามี token ค้างและระบบยังไม่ได้เช็กเสร็จ ให้รอก่อน
  if (token && !isAuthenticated) {
    return null;
  }

  // ✅ ใช้สถานะ authenticated จาก store กลางเท่านั้น
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ✅ ถ้ามีการจำกัด role → ตรวจสอบสิทธิ์
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ ถ้าผ่านทุกเงื่อนไข → แสดง component ที่อยู่ภายใน route นี้
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
