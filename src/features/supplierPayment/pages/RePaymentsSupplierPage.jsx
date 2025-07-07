import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';

const RePaymentsSupplierPage = () => {
  const navigate = useNavigate();
  const { suppliers, fetchSuppliersAction, isSupplierLoading } = useSupplierStore();

  useEffect(() => {
    fetchSuppliersAction();
  }, []);

  const handleNavigate = (supplierId) => {
    navigate('/pos/finance/payments/supplier/' + supplierId + '/create', {
      state: { supplierId },
    });
  };
  

  const filteredSuppliers = suppliers.filter((s) => {
    const creditLimit = Number(s.creditLimit || 0);
    const creditBalance = Number(s.creditBalance || 0);
    return creditLimit > 0 && creditBalance > 0;
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
                <th className="border px-4 py-2 text-center">เครดิตทั้งหมด</th>
                <th className="border px-4 py-2 text-center">เครดิตคงเหลือ</th>
                <th className="border px-4 py-2 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    ไม่พบข้อมูล Supplier ที่ตรงเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 text-sm">
                    <td className="border px-4 py-2">{s.name}</td>
                    <td className="border px-4 py-2 text-center">{s.phone}</td>
                    <td className="border px-4 py-2 text-center">
                      {s.creditLimit != null ? s.creditLimit.toLocaleString() : '-'}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {s.creditRemaining != null ? s.creditRemaining.toLocaleString() : '-'}
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

export default RePaymentsSupplierPage;
