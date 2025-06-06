// 📁 FILE: pages/pos/sales/QuickSalePage.jsx
// ✅ COMMENT: เพิ่ม callback onChangeItems ให้ส่ง localItems กลับขึ้น QuickSalePage เมื่อมีการเปลี่ยน

import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0, onChangeItems }) => {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems((prev) => {
      const merged = items.map((item) => {
        const existing = prev.find((p) => p.barcodeId === item.barcodeId);
        return {
          ...item,
          discount: existing?.discount ?? 0,
          billShare: existing?.billShare ?? 0,
        };
      });
      return merged;
    });
  }, [items]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!Array.isArray(localItems) || localItems.length === 0) return;
      const total = localItems.reduce((sum, item) => sum + item.price, 0);
      if (total === 0) return;

      const updated = localItems.map((item) => {
        const ratio = item.price / total;
        const share = billDiscount > 0 ? Math.round(billDiscount * ratio) : 0;
        return { ...item, billShare: share };
      });
      setLocalItems(updated);
    }, 300);

    return () => clearTimeout(timeout);
  }, [billDiscount]);

  useEffect(() => {
    if (typeof onChangeItems === 'function') {
      onChangeItems(localItems);
    }
  }, [localItems, onChangeItems]);

  const handleDiscountChange = (itemId, value) => {
    const updated = localItems.map((item) => {
      if (item.barcodeId === itemId) {
        const discount = isNaN(value) ? 0 : value;
        return { ...item, discount };
      }
      return item;
    });
    setLocalItems(updated);
  };

  if (!Array.isArray(localItems) || localItems.length === 0) {
    return (
      <table className="w-full text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ลำดับ</th>
            <th className="p-2 border">ชื่อสินค้า</th>
            <th className="p-2 border">บาร์โค้ด</th>
            <th className="p-2 border">ราคา</th>
            <th className="p-2 border">ส่วนลด</th>
            <th className="p-2 border">ส่วนลดท้ายบิล</th>
            <th className="p-2 border">สุทธิ</th>
            <th className="p-2 border">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="8" className="p-4 text-center text-gray-500">
              ยังไม่มีสินค้าที่จะขาย
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <table className="w-full text-left border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 border">ลำดับ</th>
          <th className="p-2 border">ชื่อสินค้า</th>
          <th className="p-2 border">บาร์โค้ด</th>
          <th className="p-2 border">ราคา</th>
          <th className="p-2 border">ส่วนลด</th>
          <th className="p-2 border">ส่วนลดท้ายบิล</th>
          <th className="p-2 border">สุทธิ</th>
          <th className="p-2 border">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {localItems.map((item, index) => {
          const discount = item.discount || 0;
          const billShare = item.billShare || 0;
          const net = Math.max(0, item.price - discount - billShare);
          return (
            <tr key={item.barcodeId}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.productName}</td>
              <td className="p-2 border">{item.barcode}</td>
              <td className="p-2 border">{item.price.toFixed(2)}</td>
              <td className="p-2 border">
                <input
                  type="number"
                  min="0"
                  className="w-24 px-2 py-1 border rounded text-right"
                  value={discount}
                  onChange={(e) => handleDiscountChange(item.barcodeId, parseFloat(e.target.value))}
                />
              </td>
              <td className="p-2 border text-right">{billShare.toLocaleString()}</td>
              <td className="p-2 border text-right">{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-2 border">
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => onRemove(item.barcodeId)}
                >
                  ลบ
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default SaleItemTable;
