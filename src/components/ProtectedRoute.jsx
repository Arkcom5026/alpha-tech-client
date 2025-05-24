// ✅ src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore'; // ✅ แก้ path store ให้ถูกต้องตามโครงสร้างระบบ

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  // ✅ ถ้าไม่มี token → redirect ไปหน้า login
  if (!token) return <Navigate to="/login" replace />;

  // ✅ ถ้ามีการจำกัด role → ตรวจสอบสิทธิ์
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ ถ้าผ่านทุกเงื่อนไข → แสดง component ที่อยู่ภายใน route นี้
  return children ? children : <Outlet />;
};

export default ProtectedRoute;