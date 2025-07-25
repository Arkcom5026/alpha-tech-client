import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';

const ListReceiptPaymentsSupplierPage = () => {
  const navigate = useNavigate();
  const { suppliers, fetchSuppliersAction, isSupplierLoading } = useSupplierStore();

  useEffect(() => {
    fetchSuppliersAction();
  }, [fetchSuppliersAction]);

  const handleNavigate = (supplierId) => {
    navigate(`/pos/finance/payments/receipt/supplier/${supplierId}`, {
      state: { supplierId },
    });
  };

  // ✅ เงื่อนไขใหม่: แสดงเฉพาะ Supplier ที่ creditBalance > 0
  const filteredSuppliers = suppliers.filter((s) => {
    const creditBalance = Number(s.creditBalance ?? 0);
    return creditBalance > 0;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        ชำระเครดิตให้ Supplier
      </h1>
      {isSupplierLoading ? (
        <p className="text-center text-gray-600">กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white shadow-sm rounded">
            <thead className="bg-blue-100 text-gray-700 text-sm">
              <tr>
                <th className="border px-4 py-2 text-left">ชื่อ Supplier</th>
                <th className="border px-4 py-2 text-center">เบอร์โทร</th>
                <th className="border px-4 py-2 text-right">เครดิตทั้งหมด</th>
                <th className="border px-4 py-2 text-right">เครดิตคงเหลือ</th>
                <th className="border px-4 py-2 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    ไม่พบข้อมูล Supplier ที่มียอดค้างชำระ
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 text-sm">
                    <td className="border px-4 py-2">{s.name}</td>
                    <td className="border px-4 py-2 text-center">{s.phone}</td>
                    <td className="border px-4 py-2 text-right">
                      {s.creditLimit != null ? Number(s.creditLimit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className={`border px-4 py-2 text-right font-semibold ${Number(s.creditBalance) < 0 ? 'text-red-600' : ''}`}>
                      {s.creditBalance != null ? Number(s.creditBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleNavigate(s.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
                      >
                        ชำระเงิน
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListReceiptPaymentsSupplierPage;
