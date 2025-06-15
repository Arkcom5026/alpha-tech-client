import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShippingForm from "../components/ShippingForm";
import { useOrderOnlineStore } from "../store/orderOnlineStore";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { submitOrderAction, isSubmitting } = useOrderOnlineStore();

  const [shippingInfo, setShippingInfo] = useState({});

  const handleSubmitOrder = async () => {
    const order = await submitOrderAction(shippingInfo);

    if (order) {
      navigate("/online/thank-you", { state: { order } });
    } else {
      // แสดง error บน UI ถ้าต้องการ
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">ข้อมูลการจัดส่ง</h1>

      <ShippingForm onChange={setShippingInfo} />

      <div className="mt-6 text-center">
        <button
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันคำสั่งซื้อ"}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
