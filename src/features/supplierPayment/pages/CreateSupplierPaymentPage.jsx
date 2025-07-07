import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom'; // ⬅ เพิ่ม useLocation
import useSupplierStore from '@/features/supplier/store/supplierStore';
import SupplierPaymentForm from '../components/SupplierPaymentForm';

export const CreateSupplierPaymentPage = () => {
  const { supplierId: supplierIdFromParams } = useParams();
  const location = useLocation(); // ⬅ ใช้เพื่อรับ state
  const supplierId = location.state?.supplierId || supplierIdFromParams;

  const { selectedSupplier, fetchSupplierByIdAction } = useSupplierStore();

  useEffect(() => {
    if (supplierId) {
      fetchSupplierByIdAction(supplierId);
    }
  }, [supplierId, fetchSupplierByIdAction]);

  if (!selectedSupplier) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
          <p className="text-gray-700 text-lg">กำลังโหลดข้อมูล Supplier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">
        บันทึกการชำระเงินให้ <span className="text-blue-700">{selectedSupplier.name}</span>
      </h1>
      <div className="bg-white border border-gray-200 shadow-xl rounded-xl p-8">
        <SupplierPaymentForm supplier={selectedSupplier} />
      </div>
    </div>
  );
};
