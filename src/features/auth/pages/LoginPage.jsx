// ✅ @filename: LoginPage.jsx
// RBAC update: ให้สิทธิ์ "จัดลำดับสินค้า" เฉพาะ ADMIN ตามนโยบายใหม่

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FaGoogle, FaFacebook, FaLock } from 'react-icons/fa';
import { useCartStore } from '@/features/online/cart/store/cartStore';

// ---- role helpers (normalize + checks)
const normalizeRole = (r) => {
  const v = (r || '').toString().trim().toLowerCase();
  return v === 'supperadmin' ? 'superadmin' : v;
};

const isStaffRole = (r) => {
  const v = normalizeRole(r);
  return v === 'admin' || v === 'superadmin' || v === 'employee';
};


const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore((state) => state.loginAction);
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const profileType = useAuthStore((state) => state.profileType);
  const authError = useAuthStore((state) => state.authError);
  const employee = useAuthStore((state) => state.employee);

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
    const pt = (profileType || '').toString().trim().toLowerCase();

    // ✅ Staff session must be employee context
    if (isStaffRole(r) || pt === 'employee') {
      if (currentPath !== '/pos/dashboard') navigate('/pos/dashboard');
    }
  }, [isLoggedIn, role, profileType, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      sessionStorage.setItem('lastUsedEmail', email);

      setError('');
      await loginAction({ emailOrPhone: email, password });

      const st = useAuthStore.getState();

      // ✅ Prefer store error (inline UI) — no dialog alert
      if (st.authError) {
        setError(st.authError);
        return;
      }

      const effectiveRole = normalizeRole(st.role);
      const effectiveProfileType = (st.profileType || '').toString().trim().toLowerCase();

      // ✅ Staff (employee/admin/superadmin) → เข้า POS
      if (isStaffRole(effectiveRole) || effectiveProfileType === 'employee') {
        // ✅ Branch context required for POS
        const branchId = st.employee?.branchId ?? null;
        if (!branchId) {
          setError('บัญชีพนักงานต้องมีสาขา (branchId) ก่อนเข้า POS');
          useAuthStore.getState().logoutAction?.();
          return;
        }

        // NOTE: keep legacy localStorage write for minimal disruption
        try {
          localStorage.setItem('token', st.token || '');
          localStorage.setItem('role', effectiveRole || '');
        } catch (storageErr) {
          console.warn('⚠️ Cannot access localStorage:', storageErr);
        }

        navigate('/pos/dashboard', { replace: true });
        return;
      }

      // ✅ Customer → flow ตะกร้า/ร้านค้าออนไลน์
      if (effectiveRole === 'customer' || effectiveProfileType === 'customer') {
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

      // กรณี role/profileType ไม่รู้จัก
      setError('ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้');
      useAuthStore.getState().logoutAction?.();
    } catch (err) {
      console.error('🔴 Login Error:', err);
      const st = useAuthStore.getState();
      const message =
        st.authError ||
        err?.response?.data?.message ||
        err?.message ||
        'เกิดข้อผิดพลาด';
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






