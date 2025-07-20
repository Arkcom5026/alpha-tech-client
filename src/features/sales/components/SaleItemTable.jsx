
// 📁 FILE: components/SaleItemTable.jsx

import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';

const SaleItemTable = ({ items = [], onRemove, billDiscount = 0 }) => {
  // ไม่จำเป็นต้องใช้ localItems state แล้ว เพราะจะอัปเดตผ่าน useSalesStore โดยตรง
  // const [localItems, setLocalItems] = useState(items);
  const {
    sharedBillDiscountPerItem, // ยังคงใช้สำหรับแสดงผลเฉลี่ย
    setSharedBillDiscountPerItem,
    updateSaleItemAction,
  } = useSalesStore();

  // useEffect นี้จะทำงานเมื่อ items หรือ billDiscount เปลี่ยนแปลง
  useEffect(() => {
    // ใช้ setTimeout เพื่อ debounce การอัปเดต store ป้องกันการ re-render ถี่เกินไป
    const handler = setTimeout(() => {
      if (!Array.isArray(items) || items.length === 0) {
        // หากไม่มีรายการสินค้า ให้รีเซ็ต sharedBillDiscountPerItem
        if (sharedBillDiscountPerItem !== 0) {
          setSharedBillDiscountPerItem(0);
        }
        return;
      }

      const totalSaleItemsPrice = items.reduce((sum, item) => sum + (typeof item.price === 'number' ? item.price : 0), 0);

      // คำนวณ billShare สำหรับแต่ละรายการและอัปเดต 'discount' ใน store
      items.forEach(item => {
        const safePrice = typeof item.price === 'number' ? item.price : 0;
        const ratio = totalSaleItemsPrice > 0 ? safePrice / totalSaleItemsPrice : 0; // ป้องกันการหารด้วยศูนย์
        const calculatedBillShare = billDiscount > 0 ? Math.round(billDiscount * ratio) : 0;

        // ตรวจสอบให้แน่ใจว่า discountWithoutBill ถูกเก็บไว้และเพิ่ม calculatedBillShare เข้าไป
        const currentDiscountWithoutBill = item.discountWithoutBill || 0;
        const newTotalDiscount = currentDiscountWithoutBill + calculatedBillShare;

        // อัปเดตเฉพาะเมื่อมีการเปลี่ยนแปลงเพื่อป้องกันการ re-render/store update ที่ไม่จำเป็น
        if (item.billShare !== calculatedBillShare || item.discount !== newTotalDiscount) {
          updateSaleItemAction(item.stockItemId, {
            billShare: calculatedBillShare,
            discount: newTotalDiscount,
          });
        }
      });

      // บรรทัดนี้ใช้สำหรับแสดงผลส่วนลดเฉลี่ยต่อรายการเท่านั้น ไม่ใช่การคำนวณส่วนลดจริง
      setSharedBillDiscountPerItem(Math.floor(billDiscount / items.length));

    }, 100); // กำหนด debounce time (100ms)

    return () => {
      clearTimeout(handler); // เคลียร์ timeout เมื่อ component unmount หรือ effect ทำงานซ้ำ
    };
  }, [billDiscount, items, updateSaleItemAction, setSharedBillDiscountPerItem]); // กำหนด dependencies

  const handleDiscountChange = (itemId, value) => {
    const newDiscountWithoutBill = isNaN(value) ? 0 : value;

    // ค้นหารายการที่กำลังแก้ไข
    const itemToUpdate = items.find(item => item.stockItemId === itemId);
    if (!itemToUpdate) return;

    // คำนวณส่วนลดรวมใหม่: ส่วนลดที่กรอก + ส่วนลดท้ายบิลที่เฉลี่ย
    const newTotalDiscount = newDiscountWithoutBill + (itemToUpdate.billShare || 0);

    // อัปเดต SaleItem ใน store
    updateSaleItemAction(itemId, {
      discountWithoutBill: newDiscountWithoutBill,
      discount: newTotalDiscount,
    });
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <table className="w-full text-left border">
        <thead className="bg-gray-100 text-center">
          <tr>
            <th className="p-2 border ">ลำดับ</th>
            <th className="p-2 border ">ชื่อสินค้า</th>
            <th className="p-2 border ">รุ่น</th>
            <th className="p-2 border ">บาร์โค้ด</th>
            <th className="p-2 border ">ราคา</th>
            <th className="p-2 border ">ส่วนลด</th>
            <th className="p-2 border ">ลดท้ายบิล</th>
            <th className="p-2 border ">สุทธิ</th>
            <th className="p-2 border ">จัดการ</th>
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
      <thead className="bg-gray-100 text-center">
        <tr>
          <th className="p-2 border w-12">ลำดับ</th>
          <th className="p-2 border w-[200px]">ชื่อสินค้า</th>
          <th className="p-2 border w-[140px]">รุ่น</th>
          <th className="p-2 border w-[100px]">บาร์โค้ด</th>
          <th className="p-2 border w-24">ราคา</th>
          <th className="p-2 border w-24">ส่วนลด</th>
          <th className="p-2 border w-24">ลดท้ายบิล</th>
          <th className="p-2 border w-24">สุทธิ</th>
          <th className="p-2 border w-20">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => { // ใช้ items โดยตรงจาก props
          const discount = item.discount || 0;
          const discountWithoutBill = item.discountWithoutBill || 0;
          const billShare = item.billShare || 0; // ใช้ item.billShare โดยตรง
          const safePrice = typeof item.price === 'number' ? item.price : 0;
          const net = safePrice - discount; // net จะคำนวณจาก discount ที่รวม billShare แล้ว
          return (
            <tr key={item.stockItemId}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{item.productName}</td>
              <td className="p-2 border">{item.model}</td>
              <td className="p-2 border text-center">{item.barcode}</td>
              <td className="p-2 border text-right">{safePrice.toFixed(2)}</td>
              <td className="p-2 border text-right">

                <input
                  type="number"
                  className="w-20  py-0 border rounded text-right"
                  placeholder="0.00"
                  value={discountWithoutBill === 0 ? '' : discountWithoutBill}
                  onChange={(e) => handleDiscountChange(item.stockItemId, parseFloat(e.target.value))}
                />

              </td>
              <td className="p-2 border text-right">{billShare.toLocaleString()}</td>
              <td className="p-2 border text-right">{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="p-2 border text-center">
                <button className="text-red-500 hover:underline " onClick={() => onRemove(item.stockItemId)}>
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
