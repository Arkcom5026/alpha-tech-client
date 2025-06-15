// ✅ CartPanel.jsx (mock version styled)
import React from "react";

const mockCartItems = [
  { id: 1, name: "โน้ตบุ๊ค Lenovo", qty: 1, price: 18500 },
  { id: 2, name: "จอ LG 27\" IPS", qty: 2, price: 5990 },
  { id: 3, name: "คีย์บอร์ด Mechanical", qty: 1, price: 1490 },
];

const CartPanel = () => {
  const total = mockCartItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div className="bg-white border rounded-xl p-4 text-sm flex flex-col h-full shadow-sm">
      <h1 className="text-lg font-semibold mb-4">ตะกร้าสินค้า</h1>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {mockCartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start border-b pb-3">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-800 truncate">{item.name}</div>
              <div className="text-xs text-gray-500 mt-1">จำนวน: {item.qty}</div>
            </div>
            <div className="text-right whitespace-nowrap pl-3">
              <div className="text-sm text-gray-700 font-medium">
                {(item.qty * item.price).toLocaleString()} ฿
              </div>
              <button className="text-red-500 text-xs hover:underline mt-1">ลบ</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t mt-4 text-sm">
        <div className="flex justify-between font-semibold mb-2">
          <span>รวมทั้งหมด</span>
          <span>{total.toLocaleString()} ฿</span>
        </div>
        <button className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition font-medium">
          ไปชำระเงิน
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
