// ✅ src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔐 หน้าล็อกอิน */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🔒 ตัวอย่างหน้าแอดมินที่ล็อกอินแล้วเท่านั้น */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <div>Admin Dashboard</div>
            </ProtectedRoute>
          }
        />

        {/* 🛑 หน้าสำหรับ role ไม่ตรง */}
        <Route path="/unauthorized" element={<div>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>} />

        {/* ✅ หน้าเริ่มต้น หรือ fallback สำหรับ 404 */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
