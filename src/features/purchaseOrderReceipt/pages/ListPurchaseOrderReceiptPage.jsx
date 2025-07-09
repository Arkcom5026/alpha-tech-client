import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import PurchaseOrderReceiptTable from '../components/purchaseOrderReceiptTable';
import usePurchaseOrderStore from '@/features/purchaseOrder/store/purchaseOrderStore';

const ListPurchaseOrderReceiptPage = () => {
  const { purchaseOrders, fetchAllPurchaseOrders, loading } = usePurchaseOrderStore();

  useEffect(() => {
    fetchAllPurchaseOrders({ status: 'PENDING,PARTIALLY_RECEIVED' });
  }, [fetchAllPurchaseOrders]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">รายการใบสั่งซื้อที่รอตรวจรับ</h1>
      </div>

      {loading ? <p>กำลังโหลดข้อมูล...</p> : <PurchaseOrderReceiptTable purchaseOrders={purchaseOrders || []} />}
    </div>
  );
};

export default ListPurchaseOrderReceiptPage;