import React from "react";
import { useCartStore } from "../store/cartStore";

const CartItemList = ({ items }) => {
  const removeFromCartAction = useCartStore((state) => state.removeFromCartAction);
  const updateQuantityAction = useCartStore((state) => state.updateQuantityAction);

  if (items.length === 0) {
    return <div className="text-gray-500">ยังไม่มีสินค้าที่เลือกไว้ในตะกร้า</div>;
  }

  const handleQuantityChange = (id, value) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantityAction(id, quantity);
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const price = item.priceAtThatTime || item.priceOnline || item.price || 0;

        return (
          <div key={item.id} className="flex justify-between items-center border p-2 rounded">
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-gray-500">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  className="w-16 border rounded px-2 py-1 text-center mr-2"
                />
                x {price.toLocaleString()} บาท
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="font-medium">
                {(item.quantity * price).toLocaleString()} บาท
              </div>
              <button
                onClick={() => removeFromCartAction(item.id)}
                className="text-red-600 hover:underline text-sm"
              >
                ลบ
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartItemList;
