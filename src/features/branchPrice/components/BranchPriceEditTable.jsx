

// 📄 BranchPriceEditTable.jsx
import React, { useEffect } from 'react';

const BranchPriceEditTable = ({
  entries = [],
  editablePrices = {},
  setEditablePrices = () => {},
  onConfirm = () => {},
  setPendingList = () => {},
  setEntries,
}) => {
  useEffect(() => {
    console.log('📥 BranchPriceEditTable: รับ entries เข้ามา →', entries);
  }, [entries]);

  // ✅ ป้องกัน entries เป็น undefined/null
  const safeEntries = Array.isArray(entries) ? entries : [];

  const handlePriceChange = (productId, field, value) => {
    console.log(`🟡 handlePriceChange: กำลังเปลี่ยน ${field} ของ productId ${productId} →`, value);
    setEditablePrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleRemove = (productId) => {
    console.log('❌ handleRemove: ยกเลิกรายการที่กำลังแก้ไข productId:', productId);
    setEditablePrices((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      console.log('🧹 handleRemove: ลบจาก editablePrices →', updated);
      return updated;
    });
    if (typeof setPendingList === 'function') {
      setPendingList((prev) => {
        const filtered = prev.filter((item) => item.product?.id !== productId);
        console.log('🧹 handleRemove: ลบจาก pendingList →', filtered);
        return filtered;
      });
    }
    if (typeof setEntries === 'function') {
      setEntries((prev) => {
        const filtered = prev.filter((item) => item.product?.id !== productId);
        console.log('🧹 handleRemove: ลบจาก entries →', filtered);
        return filtered;
      });
    }
  };

  const handleConfirm = (product) => {
    const productId = product.product?.id;
    const branchPriceId = product.branchPrice?.id;
    const editable = editablePrices[productId] || {};
    const original = product.branchPrice;

    const hasChanged =
      (editable.costPrice ?? original?.costPrice) !== original?.costPrice ||
      (editable.wholesalePrice ?? original?.priceWholesale) !== original?.priceWholesale ||
      (editable.technicianPrice ?? original?.priceTechnician) !== original?.priceTechnician ||
      (editable.retailPrice ?? original?.priceRetail) !== original?.priceRetail ||
      (editable.priceOnline ?? original?.priceOnline) !== original?.priceOnline;

    console.log('🔍 handleConfirm: ตรวจสอบการเปลี่ยนแปลงของ productId', productId, '→ hasChanged:', hasChanged);

    if (hasChanged) {
      const newEntry = {
        id: branchPriceId,
        product: {
          id: productId,
          name: product.product?.name,
          model: product.product?.model,
        },
        costPrice: editable.costPrice ?? original?.costPrice ?? 0,
        wholesalePrice: editable.wholesalePrice ?? original?.priceWholesale ?? 0,
        technicianPrice: editable.technicianPrice ?? original?.priceTechnician ?? 0,
        retailPrice: editable.retailPrice ?? original?.priceRetail ?? 0,
        priceOnline: editable.priceOnline ?? original?.priceOnline ?? 0,
      };
      console.log('✅ Confirmed new entry:', newEntry);
      onConfirm(productId, newEntry);
      handleRemove(productId);
    } else {
      console.log('⚪ ไม่มีการเปลี่ยนแปลงสำหรับ productId:', productId);
    }
  };

  return (
    <div className="overflow-x-auto text-sm">
      <h2 className="font-bold mb-2">📌 รายการที่รอเปลี่ยนราคา</h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-2 w-24">รหัส</th>
            <th className="border px-2 py-2 w-80">ชื่อสินค้า</th>
            <th className="border px-2 py-2 w-56">รุ่น</th>
            <th className="border px-2 py-2 w-20">ราคาทุน</th>
            <th className="border px-2 py-2 w-20">ราคาขายส่ง</th>
            <th className="border px-2 py-2 w-20">ราคาช่าง</th>
            <th className="border px-2 py-2 w-20">ราคาขายปลีก</th>
            <th className="border px-2 py-2 w-20">ราคาออนไลน์</th>
            <th className="border px-2 py-2 w-28">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {safeEntries.map((product) => {
            const productId = product.product?.id;
            const editable = editablePrices[productId] || {};
            console.log('🧾 render row: productId', productId, '→', product);
            return (
              <tr key={productId}>
                <td className="border px-2 py-2">{productId}</td>
                <td className="border px-2 py-2">{product.product?.name}</td>
                <td className="border px-2 py-2">{product.product?.model}</td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={editable.costPrice ?? product.branchPrice?.costPrice ?? 0}
                    onChange={(e) => handlePriceChange(productId, 'costPrice', e.target.value)}
                    className="w-full border px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={editable.wholesalePrice ?? product.branchPrice?.priceWholesale ?? ''}
                    onChange={(e) => handlePriceChange(productId, 'wholesalePrice', e.target.value)}
                    className="w-full border px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={editable.technicianPrice ?? product.branchPrice?.priceTechnician ?? ''}
                    onChange={(e) => handlePriceChange(productId, 'technicianPrice', e.target.value)}
                    className="w-full border px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={editable.retailPrice ?? product.branchPrice?.priceRetail ?? ''}
                    onChange={(e) => handlePriceChange(productId, 'retailPrice', e.target.value)}
                    className="w-full border px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="border px-2 py-2">
                  <input
                    type="number"
                    value={editable.priceOnline ?? product.branchPrice?.priceOnline ?? ''}
                    onChange={(e) => handlePriceChange(productId, 'priceOnline', e.target.value)}
                    className="w-full border px-2 py-1 rounded text-right"
                  />
                </td>
                <td className="border px-2 py-2 text-center space-x-1">
                  <button
                    onClick={() => handleConfirm(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    ยืนยัน
                  </button>
                </td>
              </tr>
            );
          })}
        {safeEntries.length === 0 && (
            <tr>
              <td className="border px-2 py-6 text-center text-gray-500" colSpan={9}>
                ไม่มีรายการ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BranchPriceEditTable;


