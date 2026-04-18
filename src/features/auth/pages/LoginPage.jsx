




// ✅ @filename: LoginPage.jsx
// SUPERADMIN login routing: แยก Global session ออกจาก POS session แบบ minimal disruption

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FaGoogle, FaFacebook, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useCartStore } from '@/features/online/cart/store/cartStore';

// ---- role helpers (normalize + checks)
const normalizeRole = (r) => {
  const v = (r || '').toString().trim().toLowerCase();
  return v === 'supperadmin' ? 'superadmin' : v;
};

const isSuperAdminRole = (r) => normalizeRole(r) === 'superadmin';

const isPosStaffRole = (r) => {
  const v = normalizeRole(r);
  return v === 'admin' || v === 'employee';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginAction = useAuthStore((state) => state.loginAction);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticatedSelector?.());
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const role = useAuthStore((state) => state.role);
  const profileType = useAuthStore((state) => state.profileType);
  const user = useAuthStore((state) => state.user);

  // ✅ แสดง username เฉพาะตอนรันบน localhost เท่านั้น
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const debugUsername = user?.username || user?.email || '';

  const [emailOrPhone, setEmailOrPhone] = useState(() => {
    const rememberedIdentifier = localStorage.getItem('rememberedLoginIdentifier');
    const legacySessionIdentifier = sessionStorage.getItem('rememberedLoginIdentifier');
    return rememberedIdentifier || legacySessionIdentifier || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(
      localStorage.getItem('rememberedLoginIdentifier') ||
      sessionStorage.getItem('rememberedLoginIdentifier'),
    );
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ emailOrPhone: '', password: '' });

  const normalizedIdentifier = emailOrPhone.trim();
  const normalizedIdentifierCompact = normalizedIdentifier.split(' ').join('').split('-').join('');
  const hasAtSign = normalizedIdentifier.includes('@');
  const hasDotAfterAt = hasAtSign && normalizedIdentifier.split('@')[1]?.includes('.');
  const normalizedPhoneValue = normalizedIdentifierCompact.startsWith('+')
    ? normalizedIdentifierCompact.slice(1)
    : normalizedIdentifierCompact;
  const isDigitsOnly = normalizedPhoneValue !== '' && normalizedPhoneValue.split('').every((char) => char >= '0' && char <= '9');
  const looksLikePhoneInput = normalizedIdentifierCompact !== '' && isDigitsOnly;
  const isIdentifierValid = !normalizedIdentifier
    ? false
    : hasAtSign
      ? hasDotAfterAt && !normalizedIdentifier.startsWith('@') && !normalizedIdentifier.endsWith('@')
      : looksLikePhoneInput
        ? normalizedPhoneValue.length >= 9 && normalizedPhoneValue.length <= 15
        : false;
  const isSubmitDisabled = loading || !isIdentifierValid || !password;

  useEffect(() => {
    if (!emailOrPhone) {
      setFieldErrors((prev) => ({
        ...prev,
        emailOrPhone: '',
      }));
      return;
    }

    let nextEmailError = '';

    if (hasAtSign) {
      if (!hasDotAfterAt || normalizedIdentifier.startsWith('@') || normalizedIdentifier.endsWith('@')) {
        nextEmailError = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
    } else if (looksLikePhoneInput) {
      if (normalizedPhoneValue.length < 9 || normalizedPhoneValue.length > 15) {
        nextEmailError = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
      }
    } else {
      nextEmailError = 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ที่ถูกต้อง';
    }

    setFieldErrors((prev) => ({
      ...prev,
      emailOrPhone: nextEmailError,
    }));
  }, [
    emailOrPhone,
    hasAtSign,
    hasDotAfterAt,
    looksLikePhoneInput,
    normalizedIdentifier,
    normalizedPhoneValue,
  ]);

  const isLoggedIn = isAuthenticated;
  const { cartItems, fetchCartAction, mergeCartAction, clearCart } = useCartStore();

  useEffect(() => {
    // ✅ ระหว่าง bootstrap auth ยังไม่ redirect
    if (isBootstrappingAuth) return;

    if (!isAuthenticated) return;

    const currentPath = window.location.pathname;
    const r = normalizeRole(role);
    const pt = (profileType || '').toString().trim().toLowerCase();

    // ✅ SUPERADMIN = Global session only
    if (isSuperAdminRole(r)) {
      if (currentPath !== '/superadmin/dashboard') {
        navigate('/superadmin/dashboard', { replace: true });
      }
      return;
    }

    // ✅ POS staff session must be employee context
    if (isPosStaffRole(r) || pt === 'employee') {
      if (currentPath !== '/pos/dashboard') {
        navigate('/pos/dashboard', { replace: true });
      }
    }
  }, [isLoggedIn, role, profileType, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ emailOrPhone: '', password: '' });

    const normalizedIdentifier = emailOrPhone.trim();
    const nextFieldErrors = { emailOrPhone: '', password: '' };

    if (!normalizedIdentifier) {
      nextFieldErrors.emailOrPhone = 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์';
    } else {
      const compactValue = normalizedIdentifier.split(' ').join('').split('-').join('');
      const hasAtSign = normalizedIdentifier.includes('@');
      const hasDotAfterAt = hasAtSign && normalizedIdentifier.split('@')[1]?.includes('.');
      const numericValue = compactValue.startsWith('+') ? compactValue.slice(1) : compactValue;
      const isDigitsOnly = numericValue !== '' && numericValue.split('').every((char) => char >= '0' && char <= '9');
      const looksLikePhone = compactValue !== '' && isDigitsOnly;

      if (hasAtSign) {
        if (!hasDotAfterAt || normalizedIdentifier.startsWith('@') || normalizedIdentifier.endsWith('@')) {
          nextFieldErrors.emailOrPhone = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
      } else if (looksLikePhone) {
        if (numericValue.length < 9 || numericValue.length > 15) {
          nextFieldErrors.emailOrPhone = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
        }
      } else {
        nextFieldErrors.emailOrPhone = 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ที่ถูกต้อง';
      }
    }

    if (!password) {
      nextFieldErrors.password = 'กรุณากรอกรหัสผ่าน';
    }

    if (nextFieldErrors.emailOrPhone || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);

    try {
      if (rememberMe && normalizedIdentifier) {
        localStorage.setItem('rememberedLoginIdentifier', normalizedIdentifier);
        sessionStorage.removeItem('rememberedLoginIdentifier');
      } else {
        localStorage.removeItem('rememberedLoginIdentifier');
        sessionStorage.removeItem('rememberedLoginIdentifier');
      }

      setError('');
      await loginAction({ emailOrPhone: normalizedIdentifier, password });

      const st = useAuthStore.getState();

      // ✅ Prefer store error (inline UI) — no dialog alert
      if (st.authError) {
        setError(st.authError);
        return;
      }

      const effectiveRole = normalizeRole(st.role);
      const effectiveProfileType = (st.profileType || '').toString().trim().toLowerCase();

      // ✅ SUPERADMIN → เข้า Global dashboard เท่านั้น
      if (isSuperAdminRole(effectiveRole)) {
        try {
          // ❌ removed legacy localStorage writes (use authStore only)
        } catch (storageErr) {
          console.warn('⚠️ Cannot access localStorage:', storageErr);
        }

        navigate('/superadmin/dashboard', { replace: true });
        return;
      }

      // ✅ POS staff (employee/admin) → เข้า POS
      if (isPosStaffRole(effectiveRole) || effectiveProfileType === 'employee') {
        // ✅ Branch context required for POS
        const branchId = st.employee?.branchId ?? null;
        if (!branchId) {
          setError('บัญชีพนักงานต้องมีสาขา (branchId) ก่อนเข้า POS');
          useAuthStore.getState().logoutAction?.();
          return;
        }

        // NOTE: keep legacy localStorage write for minimal disruption
        try {
          // ❌ removed legacy localStorage writes (use authStore only)
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
          {isLocalhost && debugUsername && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-2 py-1 inline-block">
              🛠 Dev Mode: {debugUsername}
            </div>
          )}
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

        <form onSubmit={handleLogin} autoComplete="on" className="space-y-4">
          <div>
          <input
            type="text"
            placeholder="อีเมลหรือเบอร์โทรศัพท์"
            value={emailOrPhone}
            onChange={(e) => {
              setEmailOrPhone(e.target.value);
            }}
            autoComplete="username"
            className={`w-full border px-3 py-2.5 rounded focus:outline-none focus:ring-2 ${fieldErrors.emailOrPhone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
            aria-invalid={Boolean(fieldErrors.emailOrPhone)}
          />
          {fieldErrors.emailOrPhone && (
            <p className="mt-1.5 text-sm text-red-600">{fieldErrors.emailOrPhone}</p>
          )}
        </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                autoComplete="current-password"
                className={`w-full border px-3 py-2.5 pr-11 rounded focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              จำอีเมลหรือเบอร์โทรศัพท์
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-2 rounded shadow font-medium min-h-[44px] inline-flex items-center justify-center gap-2 transition ${isSubmitDisabled ? 'bg-blue-400 cursor-not-allowed text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'}`}
            disabled={isSubmitDisabled}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              'เข้าสู่ระบบด้วยรหัสผ่าน'
            )}
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




