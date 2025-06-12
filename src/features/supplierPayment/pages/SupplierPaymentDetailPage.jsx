import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import SupplierPaymentTabs from '../components/SupplierPaymentTabs';

const SupplierPaymentDetailPage = () => {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { selectedSupplier, fetchSupplierByIdAction } = useSupplierStore();

  useEffect(() => {
    if (supplierId) {
      fetchSupplierByIdAction(supplierId);
    }
  }, [supplierId]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ข้อมูล Supplier: {selectedSupplier?.name || '-'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>ชื่อ: {selectedSupplier?.name || '-'}</div>
        <div>เบอร์โทร: {selectedSupplier?.phone || '-'}</div>
        <div>วงเงินเครดิต: {selectedSupplier?.creditLimit?.toLocaleString() || '0'} บาท</div>
        {/* หมายเหตุ: คงเหลือเครดิตจะคำนวณใน SupplierPaymentTabs */}
      </div>

      <button
        onClick={() => navigate(`/pos/finance/po-payments/supplier/${supplierId}/create-payment`)}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + ชำระเงิน
      </button>

      <SupplierPaymentTabs supplierId={supplierId} supplier={selectedSupplier} />
    </div>
  );
};

export default SupplierPaymentDetailPage;
