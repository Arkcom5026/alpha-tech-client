// ✅ CartPanel.jsx (แสดงภาพ/ชื่อ/ราคา + กดเพิ่ม-ลด-ลบสินค้า พร้อมตรวจ login)
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";

const CartPanel = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const increaseQty = useCartStore((state) => state.increaseQuantity);
  const decreaseQty = useCartStore((state) => state.decreaseQuantity);
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);
  const profile = useAuthStore((state) => state.profile);
  const isLoggedIn = !!token && !!profile;

  const handleIncrease = (id) => {
    increaseQty(id); // ✅ เพิ่มจำนวนใน store เสมอ
  };

  const handleDecrease = (id) => {
    decreaseQty(id); // ✅ ลดจำนวนใน store เสมอ
  };

  const handleRemove = (id) => {
    if (isLoggedIn) {
      removeFromCart(id); // ✅ ลบจริงจาก DB เมื่อ login แล้ว
    } else {
      useCartStore.setState((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== id),
        selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
      }));
    }
  };

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.priceAtThatTime || item.priceOnline || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  return (
    <div className="bg-white border rounded-xl p-4 text-sm flex flex-col h-full shadow-sm">
      <h1 className="text-lg font-semibold mb-4">ตะกร้าสินค้า</h1>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {cartItems.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">ไม่มีสินค้าที่เลือก</div>
        ) : (
          cartItems.map((item) => {
            const imageUrl = item.product?.productImages?.[0]?.secure_url || item.imageUrl || '/no-image.png';
            const name = item.product?.name || item.name || 'ไม่มีชื่อสินค้า';
            const price = item.priceAtThatTime || item.priceOnline || item.price || 0;

            return (
              <div key={item.id} className="flex gap-3 items-start border-b pb-3">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-16 h-16 object-contain border rounded"
                />

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
                    {name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Number(price).toLocaleString()} ฿ / ชิ้น
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 flex-wrap">
                    <button onClick={() => handleDecrease(item.id)} className="px-2 py-0.5 border rounded hover:bg-gray-100">
                      -
                    </button>
                    <span className="min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => handleIncrease(item.id)} className="px-2 py-0.5 border rounded hover:bg-gray-100">
                      +
                    </button>
                    <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:underline ml-2">
                      ลบ
                    </button>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap pt-1">
                  <div className="text-sm text-gray-700 font-medium">
                    {(item.quantity * price).toLocaleString()} ฿
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-4 border-t mt-4 text-sm">
        <div className="flex justify-between font-semibold mb-2">
          <span>รวมทั้งหมด</span>
          <span>{Number(total || 0).toLocaleString()} ฿</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/cart")}
            className="w-1/2 border border-blue-500 text-blue-600 rounded-md py-2 hover:bg-blue-50 transition font-medium"
          >
            ดูสินค้าในตะกร้า
          </button>
          <button
            className="w-1/2 bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition font-medium"
            onClick={() => navigate("/checkout")}
          >
            ไปชำระเงิน
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPanel;
