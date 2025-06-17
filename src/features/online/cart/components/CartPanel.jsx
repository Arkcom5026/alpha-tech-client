// ✅ CartPanel.jsx (ปรับ UI ตะกร้าให้ดูดียิ่งขึ้น พร้อมแสดงชื่อ/ภาพ/จำนวน/ราคาต่อชิ้น)
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

const CartPanel = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const increaseQty = useCartStore((state) => state.increaseQuantity);
  const decreaseQty = useCartStore((state) => state.decreaseQuantity);
  const total = useCartStore((state) => state.totalAmount)();
  const navigate = useNavigate();

  return (
    <div className="bg-white border rounded-xl p-4 text-sm flex flex-col h-full shadow-sm">
      <h1 className="text-lg font-semibold mb-4">ตะกร้าสินค้า</h1>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {cartItems.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">ไม่มีสินค้าที่เลือก</div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex gap-3 items-start border-b pb-3">
              <img
                src={item.imageUrl || '/no-image.png'}
                alt={item.title || item.name || 'ไม่มีชื่อสินค้า'}
                className="w-16 h-16 object-contain border rounded"
              />

              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
                  {item.title || item.name || 'ไม่มีชื่อสินค้า'}
                </div>
                <div className="text-xs text-gray-500">
                  {Number(item.price || 0).toLocaleString()} ฿ / ชิ้น
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="px-2 py-0.5 border rounded hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="min-w-[20px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="px-2 py-0.5 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:underline ml-2"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <div className="text-right whitespace-nowrap pt-1">
                <div className="text-sm text-gray-700 font-medium">
                  {(item.quantity * (item.price || 0)).toLocaleString()} ฿
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t mt-4 text-sm">
        <div className="flex justify-between font-semibold mb-2">
          <span>รวมทั้งหมด</span>
          <span>{Number(total || 0).toLocaleString()} ฿</span>
        </div>
        <button
          className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition font-medium"
          onClick={() => navigate("/checkout")}
        >
          ไปชำระเงิน
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
