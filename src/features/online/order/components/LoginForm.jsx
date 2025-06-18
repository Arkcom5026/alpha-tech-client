// LoginForm.jsx
import React, { useState } from "react";
import { useCartStore } from "../../cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import useEmployeeStore from "@/store/employeeStore";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

const LoginForm = ({ onSuccess, setShowRegister }) => {
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const fetchCartAction = useCartStore((state) => state.fetchCartAction);
  const mergeCartAction = useCartStore((state) => state.mergeCartAction);
  const loginAction = useAuthStore((state) => state.loginAction);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      console.log("🟡 เริ่ม login...");
      const { token, role, profile, profileType } = await loginAction({
        emailOrPhone: credential,
        password,
      });

      console.log("🟢 login สำเร็จ → token:", token);
      console.log("👤 profile:", profile);

      if (role === "employee" && profile?.position && profile?.branch) {
        const rawPosition = profile.position.name;
        const mappedPosition =
          rawPosition === "employee" ? "ผู้ดูแลระบบ" : rawPosition;

        useEmployeeStore.setState({
          token,
          role,
          position: mappedPosition || "__NO_POSITION__",
          branch: profile.branch,
          employee: profile,
        });
      }

      login({ token, role, profile });
      console.log("🔐 login() บันทึกที่ authStore เรียบร้อย");

      // ✅ รอให้ authStore sync ค่า token ก่อนเรียก API ต่อ
      await Promise.resolve();

      try {
        if (cartItems.length > 0) {
          console.log("🛒 mergeCartAction เริ่มทำงาน...", cartItems);
          await mergeCartAction();
          console.log("✅ mergeCartAction สำเร็จ");
        }
      } catch (mergeErr) {
        console.warn("⚠️ mergeCartAction ล้มเหลว (แต่ปล่อยผ่านได้):", mergeErr);
      }

      console.log("📦 fetchCartAction เริ่มทำงาน...");
      await fetchCartAction();
      console.log("✅ fetchCartAction สำเร็จ");

      clearCart();
      console.log("🧹 เคลียร์ cartItems ชั่วคราวเรียบร้อย");

      if (onSuccess) onSuccess(role);
    } catch (err) {
      console.error("🔴 Login Error:", err);
      const message = err?.message || "เกิดข้อผิดพลาด";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-center text-xl font-semibold text-gray-700">
        กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า
      </h2>

      <button className="w-full flex items-center justify-center border py-2 rounded hover:bg-gray-100">
        <FaGoogle className="mr-2" /> Sign in with Google
      </button>
      <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
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
            <input type="checkbox" className="mr-2" /> จำฉันไว้ในระบบ
          </label>
          <a href="#" className="text-blue-600 hover:underline">ลืมรหัสผ่าน?</a>
        </div>

        {error && <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-2 rounded">{error}</div>}

        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded shadow font-medium min-h-[44px]"
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วยรหัสผ่าน"}
        </button>
      </form>

      <div className="text-center text-sm text-gray-500">
        ยังไม่มีบัญชี?
        <button
          type="button"
          onClick={() => setShowRegister(true)}
          className="text-blue-600 hover:underline ml-1"
        >
          สมัครสมาชิก
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
