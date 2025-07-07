import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';

const ListSuppliersPaymentPage = () => {
  const navigate = useNavigate();
  const { suppliers, fetchSuppliersAction, isSupplierLoading } = useSupplierStore();

  useEffect(() => {
    fetchSuppliersAction();
  }, []);

  const handleNavigate = (supplierId, type) => {
    if (type === 'advance') {
      navigate(`/pos/finance/advance-payments/supplier/${supplierId}`);
    } else {
      navigate(`/pos/finance/payments/detail/${supplierId}`);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">เลือกรายการ Supplier</h1>

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
                <th className="border px-4 py-2 text-center">จ่ายล่วงหน้า</th>
                <th className="border px-4 py-2 text-center">ชำระเครดิต</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 text-sm">
                  <td className="border px-4 py-2">{s.name}</td>
                  <td className="border px-4 py-2 text-center">{s.phone}</td>
                  <td className="border px-4 py-2 text-center">{s.creditLimit?.toLocaleString() || '-'}</td>
                  <td className="border px-4 py-2 text-center">{s.creditRemaining.toLocaleString()}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleNavigate(s.id, 'advance')}
                      className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 transition"
                    >
                      จ่ายล่วงหน้า
                    </button>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => handleNavigate(s.id, 'credit')}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                    >
                      ชำระเครดิต
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListSuppliersPaymentPage;
