// ✅ CheckoutPage.jsx (แสดงข้อมูลสินค้า + ฟอร์ม Login/Register หรือ Customer Info ถ้ายังไม่ได้ login)
import React, { useState, useEffect } from "react";
import { useCartStore } from "../../cart/store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import CustomerInfoForm from "../components/CustomerInfoForm";
import apiClient from "@/utils/apiClient";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const total = useCartStore((state) => state.totalAmount)();
  const clearCart = useCartStore((state) => state.clearCart);
  const fetchCartAction = useCartStore((state) => state.fetchCartAction);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const updateCartItemAction = useCartStore((state) => state.updateCartItemAction);

  const token = useAuthStore((state) => state.token);
  const profile = useAuthStore((state) => state.profile);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const handleLoginSuccess = async () => {
    await fetchCartAction();
    const items = useCartStore.getState().cartItems;
    setSelectedItems(items.map(item => item.id));
  };

  useEffect(() => {
    const loadCart = async () => {
      if (token && profile) {
        await fetchCartAction();
        const items = useCartStore.getState().cartItems;
        setSelectedItems(items.map(item => item.id));
      }
    };
    loadCart();
  }, [token, profile]);

  const toggleSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleIncrease = (item) => {
    increaseQuantity(item.id);
  };

  const handleDecrease = (item) => {
    decreaseQuantity(item.id);
  };

  const submitOrder = async () => {
    try {
      if (!token) return;

      const customerRes = await apiClient.get("/customers/me");
      const customer = customerRes.data;

      const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));

      if (!selectedCartItems.length) {
        alert("กรุณาเลือกสินค้าก่อนทำรายการ");
        return;
      }

      const payload = {
        customerId: customer.id,
        items: selectedCartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await apiClient.post("/sale-orders", payload);
      clearCart();
      navigate(`/order-success/${res.data.id}`);
    } catch (err) {
      console.error("❌ submitOrder error:", err);
      alert("ไม่สามารถยืนยันคำสั่งซื้อได้");
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* 🔵 ฝั่งซ้าย: รายการสินค้า */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-semibold mb-4">ยืนยันคำสั่งซื้อ</h1>

        {cartItems.length === 0 ? (
          <div className="text-gray-500">ไม่มีสินค้าที่เลือก</div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => {
              const imageUrl = item.product?.productImages?.[0]?.secure_url || item.imageUrl || '/no-image.png';
              const name = item.product?.name || item.name || 'ไม่มีชื่อ';
              const price = item.priceAtThatTime || item.price || 0;

              return (
                <div key={item.id} className="flex gap-4 items-start border-b pb-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelection(item.id)}
                    className="mt-2"
                  />

                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-16 h-16 object-contain border rounded"
                  />

                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="px-2 py-0.5 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="px-2 py-0.5 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                      <span className="ml-2">× {Number(price).toLocaleString()} ฿</span>
                    </div>
                  </div>

                  <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {(item.quantity * price).toLocaleString()} ฿
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t text-right text-base font-semibold">
              รวมทั้งหมด: {Number(total || 0).toLocaleString()} ฿
            </div>

            {token && profile && (
              <button
                onClick={submitOrder}
                className="mt-6 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
              >
                ยืนยันการสั่งซื้อ
              </button>
            )}
          </div>
        )}
      </div>

      {/* 🟢 ฝั่งขวา: ฟอร์มเข้าสู่ระบบ หรือ สมัครสมาชิก หรือ ข้อมูลลูกค้า */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        {!token || !profile ? (
          <>
            <h2 className="text-lg font-semibold mb-4 text-center">
              กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า
            </h2>
            {showRegister ? (
              <RegisterForm setShowRegister={setShowRegister} />
            ) : (
              <LoginForm showRegister={showRegister} setShowRegister={setShowRegister} onSuccess={handleLoginSuccess} />
            )}
          </>
        ) : (
          <CustomerInfoForm />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
