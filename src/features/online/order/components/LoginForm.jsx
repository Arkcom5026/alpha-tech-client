// LoginForm.jsx
import React, { useState } from "react";
import { feedback } from '@/design-system/feedback';
import { useCartStore } from "../../cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useBranchStore } from "@/features/branch/store/branchStore";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

const LoginForm = ({ onSuccess, setShowRegister }) => {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginAction = useAuthStore((state) => state.loginAction);
  const cartItems = useCartStore((state) => state.cartItems);
  const fetchCartAction = useCartStore((state) => state.fetchCartAction);
  const mergeCartAction = useCartStore((state) => state.mergeCartAction);
  const setCurrentBranch = useBranchStore((state) => state.setCurrentBranch);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);
    try {
      const { role, profile } = await loginAction({
        emailOrPhone: credential,
        password,
      });

      if (role === "employee" && profile?.branch) {
        setCurrentBranch(profile.branch);
      }

      if (cartItems.length > 0) {
        await mergeCartAction();
      }

      await fetchCartAction();
      feedback.actionSuccess('เข้าสู่ระบบและซิงก์ตะกร้าเรียบร้อยแล้ว', 'online-checkout:login-cart-handoff:success');
      onSuccess?.(role);
    } catch (err) {
      const message = err?.message || "เข้าสู่ระบบหรือซิงก์ตะกร้าไม่สำเร็จ";
      setError(message);
      feedback.actionError(
        err,
        'เข้าสู่ระบบหรือซิงก์ตะกร้าไม่สำเร็จ',
        'online-checkout:login-cart-handoff:error',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-center text-xl font-semibold text-gray-700">
        กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า
      </h2>

      <button disabled={loading} className="w-full flex items-center justify-center border py-2 rounded hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
        <FaGoogle className="mr-2" /> Sign in with Google
      </button>
      <button disabled={loading} className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
        <FaFacebookF className="mr-2" /> เข้าสู่ระบบด้วย Facebook
      </button>

      <div className="text-center text-sm text-gray-400">หรือ</div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="อีเมลหรือเบอร์โทรศัพท์"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          autoComplete="off"
          disabled={loading}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          required
        />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          disabled={loading}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" disabled={loading} className="mr-2" /> จำฉันไว้ในระบบ
          </label>
          <a href="#" className="text-blue-600 hover:underline">ลืมรหัสผ่าน?</a>
        </div>

        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded shadow font-medium min-h-[44px] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบและซิงก์ตะกร้า..." : "เข้าสู่ระบบด้วยรหัสผ่าน"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        ยังไม่มีบัญชี?
        <button
          type="button"
          disabled={loading}
          onClick={() => setShowRegister(true)}
          className="text-blue-600 hover:underline ml-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          สมัครสมาชิก
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
