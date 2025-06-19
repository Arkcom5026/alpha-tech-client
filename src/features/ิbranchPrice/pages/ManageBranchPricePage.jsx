// 📄 ManageBranchPricePage.jsx
import React, { useEffect, useState } from 'react';

import BranchPriceForm from '../components/BranchPriceForm';
import useBranchPriceStore from '../store/branchPriceStore';


const ManageBranchPricePage = () => {
  const {
    allProductsWithPrice,
    loading,
    error,
    fetchAllProductsWithPriceAction,
  } = useBranchPriceStore();

  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchAllProductsWithPriceAction();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">จัดการราคาสินค้าสาขานี้</h1>

      {editingProduct && (
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">{`ตั้งราคาสำหรับ: ${editingProduct.product.name}`}</h2>
          <BranchPriceForm
            productId={editingProduct.product.id}
            defaultValues={editingProduct.branchPrice || {}}
            onClose={() => setEditingProduct(null)}
          />
        </div>
      )}

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && allProductsWithPrice.length === 0 && (
        <p className="text-gray-500">ยังไม่มีสินค้าในระบบ</p>
      )}

      {!loading && allProductsWithPrice.length > 0 && (
        <table className="w-full border mt-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">สินค้า</th>
              <th className="border px-2 py-1 text-right">ราคา</th>
              <th className="border px-2 py-1 text-center">เริ่มใช้</th>
              <th className="border px-2 py-1 text-center">หมดอายุ</th>
              <th className="border px-2 py-1 text-center">สถานะ</th>
              <th className="border px-2 py-1 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {allProductsWithPrice.map((entry) => (
              <tr key={entry.product.id}>
                <td className="border px-2 py-1">{entry.product.name}</td>
                <td className="border px-2 py-1 text-right">
                  {entry.branchPrice ? `${entry.branchPrice.price.toLocaleString()} บาท` : <span className="text-gray-400">-</span>}
                </td>
                <td className="border px-2 py-1 text-center">
                  {entry.branchPrice?.effectiveDate ? new Date(entry.branchPrice.effectiveDate).toLocaleDateString() : '-'}
                </td>
                <td className="border px-2 py-1 text-center">
                  {entry.branchPrice?.expiredDate ? new Date(entry.branchPrice.expiredDate).toLocaleDateString() : '-'}
                </td>
                <td className="border px-2 py-1 text-center">
                  {entry.branchPrice?.isActive ? '✅ ใช้งาน' : entry.branchPrice ? '⛔ ปิดใช้งาน' : '-'}
                </td>
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => setEditingProduct(entry)}
                    className="text-blue-600 hover:underline"
                  >
                    {entry.branchPrice ? 'แก้ไข' : 'กำหนดราคา'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageBranchPricePage;
