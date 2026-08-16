// SupplierPaymentDetailPage.js

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import useSupplierPaymentStore from '../store/supplierPaymentStore';
import SupplierPaymentHistoryTable from '../components/SupplierPaymentHistoryTable';

const SupplierPaymentDetailPage = () => {
  const { supplierId } = useParams();

  const {
    selectedSupplier,
    supplierPayments,
    isSupplierPaymentLoading,
    supplierPaymentError,
    fetchSupplierPaymentsBySupplierIdAction,
  } = useSupplierPaymentStore();

  useEffect(() => {
    if (!supplierId) return;

    Promise.resolve(fetchSupplierPaymentsBySupplierIdAction(supplierId)).catch((requestError) => {
      feedback.actionError(
        requestError,
        'โหลดประวัติการชำระเงิน Supplier ไม่สำเร็จ',
        `supplier-payment:detail:${supplierId}:load:error`,
      );
    });
  }, [supplierId, fetchSupplierPaymentsBySupplierIdAction]);

  if (isSupplierPaymentLoading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-5xl items-center justify-center px-4 py-6 text-sm text-slate-500">
        กำลังโหลดข้อมูลการชำระเงิน Supplier...
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">ข้อมูลการชำระเงิน Supplier</h1>

      {supplierPaymentError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {supplierPaymentError}
        </div>
      ) : null}

      <div className="bg-white border shadow rounded p-4 mb-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-semibold">ชื่อ:</span> {selectedSupplier?.name || '-'}
          </div>
          <div>
            <span className="font-semibold">เบอร์โทร:</span> {selectedSupplier?.phone || '-'}
          </div>
          <div>
            <div>
              <span className="font-semibold">วงเงินเครดิต:</span> {selectedSupplier?.creditLimit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} บาท
            </div>
            <div>
              <span className="font-semibold">ยอดเครดิตคงเหลือ:</span> {selectedSupplier?.creditBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} บาท
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border shadow rounded p-4">
        <SupplierPaymentHistoryTable
          supplierId={supplierId}
          supplier={selectedSupplier}
          payments={supplierPayments}
        />
      </div>
    </div>
  );
};

export default SupplierPaymentDetailPage;
