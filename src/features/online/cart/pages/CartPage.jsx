import React from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "@/features/auth/store/authStore";

const CartPage = () => {
  const cartItems = useCartStore((state) => state.cartItems) || [];
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const increaseQty = useCartStore((state) => state.increaseQuantity);
  const decreaseQty = useCartStore((state) => state.decreaseQuantity);
  const navigate = useNavigate();

  const token = useAuthStore((state) => state.token);
  const profile = useAuthStore((state) => state.profile);
  const isLoggedIn = !!token && !!profile;

  const handleIncrease = (id) => {
    increaseQty(id);
  };

  const handleDecrease = (id) => {
    decreaseQty(id);
  };

  const handleRemove = (id) => {
    if (isLoggedIn) {
      removeFromCart(id);
    } else {
      useCartStore.setState((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== id),
        selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
      }));
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.priceAtThatTime || item.priceOnline || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold border-b pb-2">ตะกร้าสินค้า</h1>

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
                className="w-20 h-20 object-contain border rounded"
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

      <div className="text-right font-semibold text-lg pt-4 border-t">
        รวมทั้งหมด: {Number(total || 0).toLocaleString()} บาท
      </div>

      <div className="text-right">
        <button
          onClick={() => navigate("/checkout")}
          disabled={cartItems.length === 0}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          ดำเนินการสั่งซื้อ
        </button>
      </div>
    </div>
  );
};

export default CartPage;
