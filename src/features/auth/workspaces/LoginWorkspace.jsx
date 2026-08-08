// src/features/auth/pages/LoginPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FaGoogle, FaFacebook, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

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
  const authChecked = useAuthStore((state) => state.authChecked);
  const authBootstrapState = useAuthStore((state) => state.authBootstrapState);
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const role = useAuthStore((state) => state.role);
  const profileType = useAuthStore((state) => state.profileType);
  const user = useAuthStore((state) => state.user);
  const employeeState = useAuthStore((state) => state.employee);
  const rememberedIdentifier = useAuthStore((state) => state.lastLoginIdentifier);
  const rememberedSessionFlag = useAuthStore((state) => state.rememberMe);

  const requestedPath = location.state?.from?.pathname || null;
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const debugUsername = user?.username || user?.email || '';

  const [emailOrPhone, setEmailOrPhone] = useState(() => rememberedIdentifier || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ emailOrPhone: '', password: '' });

  const normalizedIdentifier = emailOrPhone.trim();
  const normalizedIdentifierCompact = normalizedIdentifier.split(' ').join('').split('-').join('');
  const hasAtSign = normalizedIdentifier.includes('@');
  const hasDotAfterAt = hasAtSign && normalizedIdentifier.split('@')[1]?.includes('.');
  const normalizedPhoneValue = normalizedIdentifierCompact.startsWith('+') ? normalizedIdentifierCompact.slice(1) : normalizedIdentifierCompact;
  const isDigitsOnly = normalizedPhoneValue !== '' && normalizedPhoneValue.split('').every((char) => char >= '0' && char <= '9');
  const looksLikePhoneInput = normalizedIdentifierCompact !== '' && isDigitsOnly;
  const isIdentifierValid = !normalizedIdentifier ? false : hasAtSign ? hasDotAfterAt && !normalizedIdentifier.startsWith('@') && !normalizedIdentifier.endsWith('@') : looksLikePhoneInput ? normalizedPhoneValue.length >= 9 && normalizedPhoneValue.length <= 15 : false;
  const isSubmitDisabled = loading || !isIdentifierValid || !password;

  useEffect(() => {
    if (!emailOrPhone) {
      setFieldErrors((prev) => ({ ...prev, emailOrPhone: '' }));
      return;
    }
    let nextEmailError = '';
    if (hasAtSign) {
      if (!hasDotAfterAt || normalizedIdentifier.startsWith('@') || normalizedIdentifier.endsWith('@')) nextEmailError = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else if (looksLikePhoneInput) {
      if (normalizedPhoneValue.length < 9 || normalizedPhoneValue.length > 15) nextEmailError = 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง';
    } else {
      nextEmailError = 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์ที่ถูกต้อง';
    }
    setFieldErrors((prev) => ({ ...prev, emailOrPhone: nextEmailError }));
  }, [emailOrPhone, hasAtSign, hasDotAfterAt, looksLikePhoneInput, normalizedIdentifier, normalizedPhoneValue]);

  useEffect(() => { if (!emailOrPhone && rememberedIdentifier) setEmailOrPhone(rememberedIdentifier); }, [emailOrPhone, rememberedIdentifier]);
  useEffect(() => { if (rememberedSessionFlag || rememberedIdentifier) setRememberMe(true); }, [rememberedSessionFlag, rememberedIdentifier]);

  useEffect(() => {
    if (isBootstrappingAuth) return;
    if (!authChecked || authBootstrapState !== 'authenticated' || !isAuthenticated) return;

    const currentPath = window.location.pathname;
    if (currentPath.includes('forgot-password') || currentPath.includes('reset-password')) return;

    const r = normalizeRole(role);
    const pt = (profileType || '').toString().trim().toLowerCase();

    if (requestedPath && requestedPath !== '/login') {
      navigate(requestedPath, { replace: true });
      return;
    }

    if (isSuperAdminRole(r)) {
      navigate('/superadmin/dashboard', { replace: true });
      return;
    }

    if (isPosStaffRole(r) || pt === 'employee') {
      const branchSlug = employeeState?.branchSlug;
      if (!branchSlug) return;
      navigate(`/${branchSlug}/pos/dashboard`, { replace: true });
    }
  }, [role, profileType, navigate, isBootstrappingAuth, authChecked, authBootstrapState, employeeState, isAuthenticated, requestedPath]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ emailOrPhone: '', password: '' });

    const nextFieldErrors = { emailOrPhone: '', password: '' };
    if (!normalizedIdentifier) nextFieldErrors.emailOrPhone = 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์';
    if (!password) nextFieldErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (nextFieldErrors.emailOrPhone || nextFieldErrors.password) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);
    try {
      await loginAction({ emailOrPhone: normalizedIdentifier, password, rememberMe });
      const st = useAuthStore.getState();
      if (st.authError) {
        setError(st.authError);
        return;
      }

      const effectiveRole = normalizeRole(st.role);
      const effectiveProfileType = (st.profileType || '').toString().trim().toLowerCase();

      if (requestedPath && requestedPath !== '/login') {
        navigate(requestedPath, { replace: true });
        return;
      }

      if (isSuperAdminRole(effectiveRole)) {
        navigate('/superadmin/dashboard', { replace: true });
        return;
      }

      if (isPosStaffRole(effectiveRole) || effectiveProfileType === 'employee') {
        const branchId = st.employee?.branchId ?? null;
        const currentSlug = st.employee?.branchSlug ?? null;
        if (!branchId || !currentSlug) {
          setError('กำลังเตรียมข้อมูลร้าน กรุณารอสักครู่แล้วลองอีกครั้ง');
          return;
        }
        navigate(`/${currentSlug}/pos/dashboard`, { replace: true });
        return;
      }

      if (effectiveRole === 'customer' || effectiveProfileType === 'customer') {
        navigate(requestedPath || '/', { replace: true });
        return;
      }

      setError('ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้ กรุณาติดต่อผู้ดูแลระบบ');
    } catch (err) {
      console.error('🔴 Login Error:', err);
      setError(useAuthStore.getState().authError || err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => { window.location.href = `/api/auth/oauth/${provider}`; };

  return (
    <div className="w-full text-left">
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-lg text-teal-700">
          <FaLock />
        </span>
        <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950">
          เข้าสู่ Merchant Center
        </h2>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
          ใช้อีเมลหรือเบอร์โทรศัพท์ที่ผูกกับบัญชีร้านของคุณ
        </p>
        {isLocalhost && debugUsername && (
          <div className="mt-3 inline-block rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 font-mono text-[10px] font-bold text-amber-700">
            Dev Mode: {debugUsername}
          </div>
        )}
      </div>

      <form onSubmit={handleLogin} autoComplete="off" className="mt-7 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-extrabold text-slate-700">อีเมลหรือเบอร์โทรศัพท์</label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            autoComplete="username"
            placeholder="name@example.com หรือเบอร์โทรศัพท์"
            className={`min-h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${fieldErrors.emailOrPhone ? 'border-red-400' : 'border-slate-200'}`}
            aria-invalid={Boolean(fieldErrors.emailOrPhone)}
          />
          {fieldErrors.emailOrPhone && <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.emailOrPhone}</p>}
        </div>

        <div>
          <label className="mb-2 block text-xs font-extrabold text-slate-700">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
              }}
              autoComplete="current-password"
              placeholder="กรอกรหัสผ่าน"
              className={`min-h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm font-bold text-slate-900 outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 ${fieldErrors.password ? 'border-red-400' : 'border-slate-200'}`}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1.5 text-[11px] font-bold text-red-500">{fieldErrors.password}</p>}
        </div>

        <div className="flex items-center justify-between gap-4 text-[11px] font-bold text-slate-500">
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="mr-2 rounded border-slate-300 text-teal-600 focus:ring-teal-300"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            จำฉันไว้ในระบบ
          </label>
          <Link
            to="/partner-portal/forgot-password"
            className="text-teal-700 transition hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

        <button
          type="submit"
          className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition ${isSubmitDisabled ? 'cursor-not-allowed bg-slate-300' : 'bg-teal-600 shadow-sm hover:bg-teal-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2'}`}
          disabled={isSubmitDisabled}
        >
          {loading ? <><FaSpinner className="animate-spin" />กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-4 text-[11px] font-bold text-slate-400">หรือเข้าสู่ระบบด้วย</span></div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <FaGoogle className="text-base text-rose-500" /> Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuthLogin('facebook')}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <FaFacebook className="text-base text-[#1877F2]" /> Facebook
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
