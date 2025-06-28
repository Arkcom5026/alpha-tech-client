// 📁 FILE: pages/pos/sales/QuickSalePage.jsx
// ✅ COMMENT: เพิ่ม callback onChangeItems ให้ส่ง localItems กลับขึ้น QuickSalePage เมื่อมีการเปลี่ยน และเปลี่ยน key จาก barcodeId → stockItemId

import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0, onChangeItems }) => {
  const [localItems, setLocalItems] = useState(items);
  const { sharedBillDiscountPerItem, setSharedBillDiscountPerItem } = useSalesStore();

  useEffect(() => {
    setLocalItems((prev) => {
      const merged = items.map((item) => {
        const existing = prev.find((p) => p.stockItemId === item.stockItemId);
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
      const total = localItems.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : 0), 0);
      if (total === 0) return;

      const updated = localItems.map((item) => {
        const safePrice = typeof item.price === 'number' ? item.price : 0;
        const ratio = safePrice / total;
        const share = billDiscount > 0 ? Math.round(billDiscount * ratio) : 0;
        return { ...item, billShare: share };
      });

      const sharedPerItem = Math.floor(billDiscount / localItems.length);
      setSharedBillDiscountPerItem(sharedPerItem);

      if (JSON.stringify(localItems) !== JSON.stringify(updated)) {
        setLocalItems(updated);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [billDiscount, localItems]);

  useEffect(() => {
    if (typeof onChangeItems === 'function') {
      onChangeItems(localItems);
    }
  }, [localItems, onChangeItems]);

  const handleDiscountChange = (itemId, value) => {
    const updated = localItems.map((item) => {
      if (item.stockItemId === itemId) {
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
            <th className="p-2 border">รุ่น</th>
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
            <td colSpan="9" className="p-4 text-center text-gray-500">
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
          <th className="p-2 border">รุ่น</th>
          <th className="p-2 border">บาร์โค้ด</th>
          <th className="p-2 border">ราคา</th>
          <th className="p-2 border">ส่วนลด</th>
          <th className="p-2 border">ลดท้ายบิล</th>
          <th className="p-2 border">สุทธิ</th>
          <th className="p-2 border">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {localItems.map((item, index) => {
          const discount = item.discount || 0;
          const billShare = item.billShare || sharedBillDiscountPerItem || 0;
          const safePrice = typeof item.price === 'number' ? item.price : 0;
          const net = safePrice - discount - billShare;
          return (
            <tr key={item.stockItemId}>
              <td className="p-2 border  min-w-[40px]">{index + 1}</td>
              <td className="p-2 border min-w-[130px]">{item.productName}</td>
              <td className="p-2 border min-w-[130px]">{item.model}</td>
              <td className="p-2 border min-w-[100px]">{item.barcode}</td>
              <td className="p-2 border min-w-[80px]">{safePrice.toFixed(2)}</td>
              <td className="p-2 border min-w-[80px]">
                <input
                  type="number"
                  className={`w-20 px-2 py-1 border rounded text-right ${discount < 0 ? 'text-red-600' : ''}`}
                  value={discount}
                  onChange={(e) => handleDiscountChange(item.stockItemId, parseFloat(e.target.value))}
                />
              </td>
              <td className="p-2  border text-right min-w-[40px] ">{billShare.toLocaleString()}</td>
              <td className="p-2 border text-right min-w-[80px]">{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-2 border ">
                <button
                  className="text-red-500 hover:underline  "
                  onClick={() => onRemove(item.stockItemId)}
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
