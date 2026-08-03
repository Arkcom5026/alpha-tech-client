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
  const isBootstrappingAuth = useAuthStore((state) => state.isBootstrappingAuth);
  const role = useAuthStore((state) => state.role);
  const profileType = useAuthStore((state) => state.profileType);
  const user = useAuthStore((state) => state.user);
  const employeeState = useAuthStore((state) => state.employee);
  const rememberedIdentifier = useAuthStore((state) => state.lastLoginIdentifier);
  const rememberedSessionFlag = useAuthStore((state) => state.rememberMe);

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

  const isLoggedIn = isAuthenticated;

  useEffect(() => { if (!emailOrPhone && rememberedIdentifier) setEmailOrPhone(rememberedIdentifier); }, [emailOrPhone, rememberedIdentifier]);
  useEffect(() => { if (rememberedSessionFlag || rememberedIdentifier) setRememberMe(true); }, [rememberedSessionFlag, rememberedIdentifier]);

  useEffect(() => {
    if (isBootstrappingAuth) return;

    const currentPath = window.location.pathname;
    if (currentPath.includes('forgot-password') || currentPath.includes('reset-password')) return;
    if (!isAuthenticated) return;

    const r = normalizeRole(role);
    const pt = (profileType || '').toString().trim().toLowerCase();

    if (isSuperAdminRole(r)) {
      if (currentPath !== '/superadmin/dashboard') navigate('/superadmin/dashboard', { replace: true });
      return;
    }

    if (isPosStaffRole(r) || pt === 'employee') {
      const branchSlug = employeeState?.branchSlug || 'general-pos';
      const targetDynamicPath = `/${branchSlug}/pos/dashboard`;
      if (currentPath !== targetDynamicPath) navigate(targetDynamicPath, { replace: true });
    }
  }, [isLoggedIn, role, profileType, navigate, isBootstrappingAuth, employeeState, location.pathname, isAuthenticated]);

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

      if (isSuperAdminRole(effectiveRole)) {
        navigate('/superadmin/dashboard', { replace: true });
        return;
      }

      if (isPosStaffRole(effectiveRole) || effectiveProfileType === 'employee') {
        const branchId = st.employee?.branchId ?? null;
        if (!branchId) {
          setError('บัญชีพนักงานต้องมีสาขา (branchId) ก่อนเข้า POS');
          useAuthStore.getState().logoutAction?.();
          navigate('/partner-portal', { replace: true });
          return;
        }
        const currentSlug = st.employee?.branchSlug || 'general-pos';
        navigate(`/${currentSlug}/pos/dashboard`, { replace: true });
        return;
      }

      if (effectiveRole === 'customer' || effectiveProfileType === 'customer') {
        navigate(location.state?.from?.pathname || '/', { replace: true });
        return;
      }

      setError('ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้');
      useAuthStore.getState().logoutAction?.();
      navigate('/partner-portal', { replace: true });
    } catch (err) {
      console.error('🔴 Login Error:', err);
      setError(useAuthStore.getState().authError || err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => { window.location.href = `/api/auth/oauth/${provider}`; };

  return (
    <div className="w-full rounded-[24px] border border-slate-200 bg-white px-6 py-7 text-left shadow-[0_12px_35px_rgba(15,23,42,0.10)] sm:px-8 sm:py-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-xl text-orange-500 shadow-sm">
          <FaLock />
        </div>
        <h2 className="mt-4 text-xl font-black tracking-tight text-slate-950">เข้าสู่ระบบ Merchant Center</h2>
        <p className="mt-2 text-xs font-semibold text-slate-500">กรุณาเข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ</p>
        {isLocalhost && debugUsername && (
          <div className="mt-2 inline-block rounded border border-orange-200 bg-orange-50 px-2 py-1 font-mono text-[10px] font-bold text-orange-700">Dev Mode: {debugUsername}</div>
        )}
      </div>

      <form onSubmit={handleLogin} autoComplete="off" className="mt-7 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-black text-slate-700">อีเมลหรือเบอร์โทรศัพท์</label>
          <input type="text" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} autoComplete="username" className={`min-h-12 w-full rounded-xl border bg-white px-4 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${fieldErrors.emailOrPhone ? 'border-red-400' : 'border-slate-200'}`} aria-invalid={Boolean(fieldErrors.emailOrPhone)} />
          {fieldErrors.emailOrPhone && <p className="mt-1 text-[11px] font-bold text-red-500">{fieldErrors.emailOrPhone}</p>}
        </div>

        <div>
          <label className="mb-2 block text-xs font-black text-slate-700">รหัสผ่าน</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' })); }} autoComplete="current-password" className={`min-h-12 w-full rounded-xl border bg-white px-4 pr-12 text-sm font-bold text-slate-900 outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${fieldErrors.password ? 'border-red-400' : 'border-slate-200'}`} aria-invalid={Boolean(fieldErrors.password)} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-[11px] font-bold text-red-500">{fieldErrors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <label className="flex cursor-pointer items-center">
            <input type="checkbox" className="mr-2 rounded border-slate-300 text-orange-500 focus:ring-orange-300" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> จำฉันไว้ในระบบ
          </label>
          <Link to="/partner-portal/forgot-password" className="text-orange-500 hover:text-orange-700">ลืมรหัสผ่าน?</Link>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

        <button type="submit" className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white shadow-md transition-all ${isSubmitDisabled ? 'cursor-not-allowed bg-slate-300 shadow-none' : 'bg-orange-500 hover:bg-orange-600 active:scale-[0.99]'}`} disabled={isSubmitDisabled}>
          {loading ? <><FaSpinner className="animate-spin" />กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-4 text-[11px] font-bold text-slate-400">หรือ</span></div>
      </div>

      <div className="space-y-3">
        <button type="button" onClick={() => handleOAuthLogin('google')} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50">
          <FaGoogle className="text-base text-orange-500" /> ลงชื่อเข้าใช้ด้วย Google
        </button>
        <button type="button" onClick={() => handleOAuthLogin('facebook')} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-700 shadow-sm transition-all hover:bg-slate-50">
          <FaFacebook className="text-base text-[#1877F2]" /> ลงชื่อเข้าใช้ด้วย Facebook
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
