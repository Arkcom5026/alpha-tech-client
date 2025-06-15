import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order; // ส่งจาก CheckoutPage มา

  useEffect(() => {
    if (!order) {
      // ถ้าเข้าหน้าโดยตรงโดยไม่มีข้อมูล → กลับหน้าแรก
      navigate("/online", { replace: true });
    }
  }, [order, navigate]);

  return (
    <div className="max-w-xl mx-auto text-center py-20 px-4">
      <h1 className="text-3xl font-bold mb-4 text-green-600">ขอบคุณสำหรับการสั่งซื้อ!</h1>
      <p className="text-lg mb-6">คำสั่งซื้อของคุณได้รับการยืนยันแล้ว</p>

      {order && (
        <div className="mb-6">
          <p>หมายเลขคำสั่งซื้อของคุณคือ</p>
          <p className="text-xl font-semibold text-gray-800 mt-2">{order.code}</p>
        </div>
      )}

      <button
        onClick={() => navigate("/online")}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        กลับไปหน้าแรก
      </button>
    </div>
  );
};

export default ThankYouPage;
