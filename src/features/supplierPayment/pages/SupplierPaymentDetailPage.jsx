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
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">ข้อมูล Supplier</h1>

      <div className="bg-white border shadow rounded p-4 mb-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-semibold">ชื่อ:</span> {selectedSupplier?.name || '-'}
          </div>
          <div>
            <span className="font-semibold">เบอร์โทร:</span> {selectedSupplier?.phone || '-'}
          </div>
          <div>
            <span className="font-semibold">วงเงินเครดิต:</span> {selectedSupplier?.creditLimit?.toLocaleString() || '0'} บาท
          </div>
          <div>
            <span className="font-semibold">เครดิตคงเหลือ:</span> {selectedSupplier?.creditRemaining?.toLocaleString() || '0'} บาท
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(`/pos/finance/po-payments/supplier/${supplierId}/create-payment`)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + ชำระเงิน
        </button>
      </div>

      <div className="bg-white border shadow rounded p-4">
        <SupplierPaymentTabs supplierId={supplierId} supplier={selectedSupplier} />
      </div>
    </div>
  );
};

export default SupplierPaymentDetailPage;
