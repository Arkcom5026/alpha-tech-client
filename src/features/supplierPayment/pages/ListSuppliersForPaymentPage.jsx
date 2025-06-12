import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';

const ListSuppliersForPaymentPage = () => {
  const navigate = useNavigate();
  const { suppliers, fetchAllSuppliersAction, isSupplierLoading } = useSupplierStore();

  useEffect(() => {
    fetchAllSuppliersAction();
  }, []);

  const handleSelectSupplier = (supplierId) => {
    navigate(`/pos/finance/po-payments/supplier/${supplierId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">เลือกรายการ Supplier</h1>

      {isSupplierLoading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ชื่อ Supplier</th>
              <th className="border px-2 py-1">เบอร์โทร</th>
              <th className="border px-2 py-1">เครดิตทั้งหมด</th>
              <th className="border px-2 py-1">เครดิตคงเหลือ</th>
              <th className="border px-2 py-1">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => {              
             
              return (
                <tr key={s.id} className="text-center">
                  <td className="border px-2 py-1">{s.name}</td>
                  <td className="border px-2 py-1">{s.phone}</td>
                  <td className="border px-2 py-1">{s.creditLimit?.toLocaleString() || '-'}</td>
                  <td className="border px-2 py-1">{s.creditRemaining.toLocaleString()}</td>
                  <td className="border px-2 py-1">
                    <button
                      onClick={() => handleSelectSupplier(s.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListSuppliersForPaymentPage;


