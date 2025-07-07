import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import SupplierTable from '@/features/supplier/components/SupplierTable';

const AdvancePaymentsSupplierPage = () => {
  const navigate = useNavigate();
  const { suppliers, fetchSuppliersAction, isSupplierLoading } = useSupplierStore();

  useEffect(() => {
    fetchSuppliersAction();
  }, []);

  const handleNavigate = (supplierId) => {
    navigate('/pos/finance/advance-payments/supplier/' + supplierId);
  };

  const filteredSuppliers = suppliers.filter((s) => s.creditLimit === 0 && s.creditRemaining === 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">จ่ายเงินล่วงหน้าให้ Supplier</h1>

      {isSupplierLoading ? (
        <p className="text-center text-gray-600">กำลังโหลดข้อมูล...</p>
      ) : (
        <SupplierTable
          suppliers={filteredSuppliers}
          isAdvancePage={true}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default AdvancePaymentsSupplierPage;









