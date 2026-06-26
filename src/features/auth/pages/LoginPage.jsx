// src/features/auth/pages/LoginPage.jsx
// 🏛️ Masterpiece Single Container Edition: Unified Partner Portal Onboarding (Mass Market Balanced Wide Design)

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

      if (currentPath !== targetDynamicPath) {
        navigate(targetDynamicPath, { replace: true });
      }
    }
  }, [isLoggedIn, role, profileType, navigate, isBootstrappingAuth, employeeState, location.pathname]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ emailOrPhone: '', password: '' });

    const normalizedIdentifier = emailOrPhone.trim();
    const nextFieldErrors = { emailOrPhone: '', password: '' };

    if (!normalizedIdentifier) nextFieldErrors.emailOrPhone = 'กรุณากรอกอีเมลหรือเบอร์โทรศัพท์';
    if (!password) nextFieldErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (nextFieldErrors.emailOrPhone || nextFieldErrors.password) { setFieldErrors(nextFieldErrors); return; }

    setLoading(true);

    try {
      setError('');
      await loginAction({ emailOrPhone: normalizedIdentifier, password, rememberMe });
      const st = useAuthStore.getState();

      if (st.authError) { setError(st.authError); return; }

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
        const fromPath = location.state?.from?.pathname || '/';
        navigate(fromPath, { replace: true });
        return;
      }

      setError('ไม่สามารถระบุสิทธิ์ผู้ใช้งานได้');
      useAuthStore.getState().logoutAction?.();
      navigate('/partner-portal', { replace: true });
    } catch (err) {
      console.error('🔴 Login Error:', err);
      setError(useAuthStore.getState().authError || err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาด');
    } finally {
      loading && setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => { window.location.href = `/api/auth/oauth/${provider}`; };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 text-center w-full shadow-2xl shadow-black/20 text-left">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl flex items-center justify-center text-lg mx-auto shadow-md shadow-orange-500/20">
          <FaLock />
        </div>
        <h3 className="font-black text-lg text-white tracking-tight pt-1">เข้าสู่ระบบ Merchant Center</h3>
        <p className="text-slate-500 text-xs font-semibold">กรุณาเข้าเซสชันจัดการบัญชีร้านค้า</p>
        
        {isLocalhost && debugUsername && (
          <div className="mt-2 text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded px-2 py-0.5 inline-block">
            🛠 Dev Mode: {debugUsername}
          </div>
        )}
      </div>

      <div className="space-y-2.5 pt-1">
        <button type="button" onClick={() => handleOAuthLogin('google')} className="flex items-center justify-center gap-2.5 w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] min-h-[44px]">
          <FaGoogle className="text-orange-500 text-sm" />
          <span>Sign in with Google</span>
        </button>
        <button type="button" onClick={() => handleOAuthLogin('facebook')} className="flex items-center justify-center gap-2.5 w-full bg-[#1877F2] hover:bg-[#145dc8] text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98] min-h-[44px]">
          <FaFacebook className="text-white text-sm" />
          <span>เข้าสู่ระบบด้วย Facebook</span>
        </button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
        <div className="relative flex justify-center text-[11px] font-bold uppercase"><span className="bg-[#0c101b] px-3 text-slate-500">หรือ</span></div>
      </div>

      <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
        <div className="space-y-1">
          <input type="text" placeholder="อีเมลหรือเบอร์โทรศัพท์" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} autoComplete="off" className={`w-full px-3.5 py-2.5 bg-white/5 border rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-slate-600 border-white/10 focus:border-orange-500 focus:bg-white/10 ${fieldErrors.emailOrPhone ? 'border-red-500/50 focus:ring-4 focus:ring-red-500/10' : ''}`} aria-invalid={Boolean(fieldErrors.emailOrPhone)} />
          {fieldErrors.emailOrPhone && <p className="mt-1 text-[11px] font-bold text-red-400">{fieldErrors.emailOrPhone}</p>}
        </div>

        <div className="space-y-1">
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' })); }} autoComplete="new-password" className={`w-full px-3.5 py-2.5 pr-11 bg-white/5 border rounded-xl text-xs font-bold text-white outline-none transition-all placeholder:text-slate-700 border-white/10 focus:border-orange-500 focus:bg-white/10 ${fieldErrors.password ? 'border-red-500/50 focus:ring-4 focus:ring-red-500/10' : ''}`} aria-invalid={Boolean(fieldErrors.password)} />
            <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500 hover:text-slate-400">{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-[11px] font-bold text-red-400">{fieldErrors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 select-none">
          <label className="flex items-center cursor-pointer hover:text-slate-300 transition-colors">
            <input type="checkbox" className="mr-2 rounded border-white/10 bg-white/5 text-orange-500 focus:ring-0 focus:ring-offset-0" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> จําฉันไว้ในระบบ
          </label>
          
          {/* 🟢 [BUG SOLVED]: สับรางยิงลิงก์เข้า Absolute Path ไปพิกัดสายส่งหลักของระบบอย่างแม่นยำ[cite: 6, 8] */}
          <Link to="/partner-portal/forgot-password" className="text-orange-400 hover:text-orange-300 transition-colors">ลืมรหัสผ่าน?</Link>
        </div>

        {error && <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">{error}</div>}

        <button type="submit" className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all duration-200 inline-flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98] ${isSubmitDisabled ? 'bg-orange-500/30 cursor-not-allowed text-white/50 shadow-none' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/15'}`} disabled={isSubmitDisabled}>
          {loading ? (<><FaSpinner className="animate-spin text-sm" /><span>กำลังยืนยันสิทธิ์...</span></>) : 'เข้าสู่ระบบด้วยรหัสผ่าน'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;