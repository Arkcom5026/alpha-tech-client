
// 📁 FILE: components/SaleItemTable.jsx

import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0 }) => {
  const [localItems, setLocalItems] = useState(items);
  const {
    sharedBillDiscountPerItem,
    setSharedBillDiscountPerItem,
    updateSaleItemAction,
  } = useSalesStore();

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

  const handleDiscountChange = (itemId, value) => {
    const updated = localItems.map((item) => {
      if (item.stockItemId === itemId) {
        const discountWithoutBill = isNaN(value) ? 0 : value;
        const newDiscount = discountWithoutBill + (item.billShare || 0);
        updateSaleItemAction(itemId, {
          discountWithoutBill,
          discount: newDiscount,
        });
        return { ...item, discountWithoutBill, discount: newDiscount };
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
          const discountWithoutBill = item.discountWithoutBill || 0;
          const billShare = item.billShare || sharedBillDiscountPerItem || 0;
          const safePrice = typeof item.price === 'number' ? item.price : 0;
          const net = safePrice - discount;
          return (
            <tr key={item.stockItemId}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.productName}</td>
              <td className="p-2 border">{item.model}</td>
              <td className="p-2 border">{item.barcode}</td>
              <td className="p-2 border">{safePrice.toFixed(2)}</td>
              <td className="p-2 border">

                <input
                  type="number"
                  className="w-20 px-2 py-1 border rounded text-right"
                  placeholder="0.00"
                  value={discountWithoutBill === 0 ? '' : discountWithoutBill}
                  onChange={(e) => handleDiscountChange(item.stockItemId, parseFloat(e.target.value))}
                />

              </td>
              <td className="p-2 border text-right">{billShare.toLocaleString()}</td>
              <td className="p-2 border text-right">{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-2 border">
                <button className="text-red-500 hover:underline" onClick={() => onRemove(item.stockItemId)}>
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
