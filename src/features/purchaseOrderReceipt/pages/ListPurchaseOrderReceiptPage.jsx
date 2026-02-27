import React, { useEffect } from 'react';

import PurchaseOrderReceiptTable from '../components/purchaseOrderReceiptTable';
import usePurchaseOrderStore from '@/features/purchaseOrder/store/purchaseOrderStore';

const ListPurchaseOrderReceiptPage = () => {
  const {
    purchaseOrders,
    fetchAllPurchaseOrders,
    loading,
    error,
    clearErrorAction,
  } = usePurchaseOrderStore();

  useEffect(() => {
    // ✅ Use stable status values (lowercase) to avoid backend mismatch risk
    fetchAllPurchaseOrders({ status: 'pending,partially_received' });
  }, [fetchAllPurchaseOrders]);

  return (
    <div className="p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">รายการใบสั่งซื้อที่รอตรวจรับ</h1>
      </div>

      {/* ✅ UI-based error (no dialog) */}
      {error && (
        <div className="border rounded-md p-3 bg-white">
          <div className="text-sm text-rose-700">{error}</div>
          <button
            type="button"
            onClick={() => clearErrorAction?.()}
            className="mt-2 text-xs text-gray-600 underline"
          >
            ปิดข้อความ
          </button>
        </div>
      )}

      <PurchaseOrderReceiptTable
        purchaseOrders={Array.isArray(purchaseOrders) ? purchaseOrders : []}
        loading={loading}
      />
    </div>
  );
};

export default ListPurchaseOrderReceiptPage;