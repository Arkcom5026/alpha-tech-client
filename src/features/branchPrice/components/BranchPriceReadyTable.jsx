// 📄 BranchPriceReadyTable.jsx
import React from 'react';

const displayPrice = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const BranchPriceReadyTable = ({ readyEntries, onRemove }) => {
  return (
    <div className="overflow-x-auto text-sm">
      <h2 className="font-bold mb-2 text-green-700">✅ รายการที่พร้อมบันทึก</h2>
      <table className="min-w-full table-auto border border-green-400">
        <thead>
          <tr className="bg-green-100">
            <th className="border px-2 py-2 w-24">รหัส</th>
            <th className="border px-2 py-2 w-80">ชื่อสินค้า</th>
            <th className="border px-2 py-2 w-56">รุ่น</th>
            <th className="border px-2 py-2 w-20">ราคาทุน</th>
            <th className="border px-2 py-2 w-20">ราคาขายส่ง</th>
            <th className="border px-2 py-2 w-20">ราคาช่าง</th>
            <th className="border px-2 py-2 w-20">ราคาขายปลีก</th>
            <th className="border px-2 py-2 w-20">ราคาออนไลน์</th>
            <th className="border px-2 py-2 w-20">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {readyEntries.map((item) => (
            <tr key={item.product?.id} className="bg-green-50">
              <td className="border px-2 py-2">{item.product?.id}</td>
              <td className="border px-2 py-2">{item.product?.name}</td>
              <td className="border px-2 py-2">{item.product?.model}</td>
              <td className="border px-2 py-2 text-right">{displayPrice(item.costPrice)}</td>
              <td className="border px-2 py-2 text-right">{displayPrice(item.wholesalePrice)}</td>
              <td className="border px-2 py-2 text-right">{displayPrice(item.technicianPrice)}</td>
              <td className="border px-2 py-2 text-right">{displayPrice(item.retailPrice)}</td>
              <td className="border px-2 py-2 text-right">{displayPrice(item.priceOnline)}</td>
              <td className="border px-2 py-2 text-center">
                <button
                  onClick={() => onRemove(item.product?.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchPriceReadyTable;
