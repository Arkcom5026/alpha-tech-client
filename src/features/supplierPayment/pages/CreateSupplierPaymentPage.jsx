import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import SupplierPaymentForm from '../components/SupplierPaymentForm';
import SupplierPaymentTabs from '../components/SupplierPaymentTabs';

export const CreateSupplierPaymentPage = () => {
  const { supplierId } = useParams();
  const { selectedSupplier, fetchSupplierByIdAction } = useSupplierStore();

  useEffect(() => {
   
    if (supplierId) {
      fetchSupplierByIdAction(supplierId);
    }
  }, [supplierId]);

  if (!selectedSupplier) {
    return <div className="p-4">กำลังโหลดข้อมูล Supplier...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">บันทึกการชำระเงินให้ {selectedSupplier.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SupplierPaymentForm supplier={selectedSupplier} />
        <SupplierPaymentTabs supplierId={supplierId} supplier={selectedSupplier} />
      </div>
    </div>
  );
};
