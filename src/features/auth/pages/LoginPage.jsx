// ✅ @filename: LoginPage.jsx
// RBAC update: ให้สิทธิ์ "จัดลำดับสินค้า" เฉพาะ ADMIN ตามนโยบายใหม่

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FaGoogle, FaFacebook, FaLock } from 'react-icons/fa';
import { useCartStore } from '@/features/online/cart/store/cartStore';

// ---- role helpers (normalize + checks)
const normalizeRole = (r) => {
  const v = (r || '').toLowerCase();
  return v === 'supperadmin' ? 'superadmin' : v;
};
const isStaffRole = (r) => {
  const v = normalizeRole(r);
  return v === 'admin' || v === 'superadmin' || v === 'employee';
};

// ⛳ RBAC capabilities ตามนโยบายล่าสุด
// - superadmin: จัดการสิทธิ์/สาขา (NO product ordering)
// - admin: จัดการลำดับสินค้า/ข้อมูลสาขาได้
// - employee: ปฏิบัติการทั่วไป
const buildCapabilities = (role) => {
  const r = normalizeRole(role);
  return {
    isSuperAdmin: r === 'superadmin',
    isAdmin: r === 'admin',
    isEmployee: r === 'employee',
    // ความสามารถหลักๆ
    canManageBranches: r === 'superadmin' || r === 'admin',
    canGrantPermissions: r === 'superadmin',
    canManageProductOrdering: r === 'admin', // ⬅️ ตามสเปก: ให้เฉพาะ Admin
  };
};

// ⛳ กำหนดสาขาเริ่มต้นให้ SuperAdmin (กันบางหน้าที่ require branchId)
const SUPERADMIN_BRANCH_ID = Number(import.meta?.env?.VITE_MAIN_BRANCH_ID) || 1;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore((state) => state.loginAction);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);

  const [email, setEmail] = useState(() => sessionStorage.getItem('lastUsedEmail') || 'advicebanphot@gmail.com');
  const [password, setPassword] = useState('Arkcom-5026');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!token;
  const { cartItems, fetchCartAction, mergeCartAction, clearCart } = useCartStore();

  useEffect(() => {
    if (!isLoggedIn) return;
    const currentPath = window.location.pathname;
    const r = normalizeRole(role);
    if (isStaffRole(r) && currentPath !== '/pos/dashboard') {
      navigate('/pos/dashboard');
    }
  }, [isLoggedIn, role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      sessionStorage.setItem('lastUsedEmail', email);
      const { token, role: roleFromServer } = await loginAction({ emailOrPhone: email, password });
      const r = normalizeRole(roleFromServer);
      const caps = buildCapabilities(r);

      // 🔐 เคสพิเศษ: SuperAdmin → mock employee + branchId แบบ hard-coded
      if (r === 'superadmin') {
        useAuthStore.getState().setUser({
          token,
          role: r,
          ...caps,
          employee: {
            id: '__SUPERADMIN__',
            name: 'Super Admin',
            phone: '',
            email: email,
            positionName: 'SuperAdmin',
            branchId: SUPERADMIN_BRANCH_ID,
          },
        });
        try {
          localStorage.setItem('role', r);
          localStorage.setItem('token', token);
        } catch (storageErr) {
          console.warn('⚠️ Cannot access localStorage:', storageErr);
        }
        navigate('/pos/dashboard', { replace: true });
        return;
      }

      if (isStaffRole(r)) {
        // พนักงาน / แอดมิน → เข้า POS
        useAuthStore.getState().setUser({
          token,
          role: r,
          ...caps,
          employee: {
            id: r === 'admin' ? '__ADMIN__' : '__EMPLOYEE__',
            name: r === 'admin' ? 'ผู้ดูแลสาขา' : 'พนักงาน',
            phone: '',
            email,
            positionName: r === 'admin' ? 'Admin' : 'Employee',
            branchId: SUPERADMIN_BRANCH_ID,
          },
        });
        try {
          localStorage.setItem('role', r);
          localStorage.setItem('token', token);
        } catch (storageErr) {
          console.warn('⚠️ Cannot access localStorage:', storageErr);
        }
        navigate('/pos/dashboard', { replace: true });
        return;
      }

      if (r === 'customer') {
        // ลูกค้า → flow ตะกร้า/ร้านค้าออนไลน์
        useAuthStore.getState().setUser({
          token,
          role: r,
          customer: {
            id: '__CUSTOMER__',
            name: 'ลูกค้า',
            phone: '',
            email,
          },
        });

        try {
          if (cartItems.length > 0) {
            await mergeCartAction();
            clearCart();
          }
          await fetchCartAction();
        } catch (mergeErr) {
          console.warn('⚠️ mergeCartAction หรือ fetchCartAction ล้มเหลว:', mergeErr);
        }

        const fromPath = location.state?.from?.pathname || '/';
        navigate(fromPath, { replace: true });
        return;
      }

      // กรณี role ไม่รู้จัก → logout หรือแสดง error
      setError('ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้');
      useAuthStore.getState().logoutAction?.();
    } catch (err) {
      console.error('🔴 Login Error:', err);
      const message = err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-8 shadow-lg rounded-xl">
        <div className="text-center">
          <FaLock className="mx-auto text-3xl text-green-600 mb-2" />
          <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>
          <p className="text-sm text-gray-500">กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded shadow min-h-[44px]"
          >
            <FaGoogle className="text-xl mr-2" /> Sign in with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('facebook')}
            className="flex items-center justify-center w-full bg-[#1877F2] hover:bg-[#145dc8] text-white py-2 rounded shadow min-h-[44px]"
          >
            <FaFacebook className="text-xl mr-2" /> เข้าสู่ระบบด้วย Facebook
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">หรือ</span>
          </div>
        </div>

        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
          <input
            type="text"
            placeholder="อีเมลหรือเบอร์โทรศัพท์"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              จำฉันไว้ในระบบ
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              ลืมรหัสผ่าน?
            </a>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded shadow font-medium min-h-[44px]"
            disabled={loading}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วยรหัสผ่าน'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ยังไม่มีบัญชี?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            สมัครสมาชิก
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
