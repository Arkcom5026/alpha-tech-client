// ✅ @filename: LoginPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FaGoogle, FaFacebook, FaLock } from 'react-icons/fa';
import { useBranchStore } from '@/features/branch/store/branchStore';
import { useCartStore } from '@/features/online/cart/store/cartStore';

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
    if (role === 'admin' && currentPath !== '/admin') navigate('/admin');
    else if (role === 'employee' && currentPath !== '/pos/dashboard') navigate('/pos/dashboard');
  }, [isLoggedIn, role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      sessionStorage.setItem('lastUsedEmail', email);
      const { token, role, profile } = await loginAction({ emailOrPhone: email, password });

      if (role === 'employee' && profile?.position && profile?.branch) {
        const rawPosition = profile.position.name;
        const mappedPosition = rawPosition === 'employee' ? 'ผู้ดูแลระบบ' : rawPosition;

        const branchFull = await useBranchStore.getState().loadAndSetBranchByIdAction(profile.branch.id);

        useAuthStore.getState().setUser({
          token,
          role,
          employee: {
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
            positionName: mappedPosition || '__NO_POSITION__',
            branchId: profile.branch.id,
          },
        });

        useBranchStore.getState().setCurrentBranch(branchFull);
        navigate('/pos/dashboard', { replace: true });
      }

      if (role === 'customer') {
        useAuthStore.getState().setUser({
          token,
          role,
          customer: {
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            email: profile.email,
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
      }

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
