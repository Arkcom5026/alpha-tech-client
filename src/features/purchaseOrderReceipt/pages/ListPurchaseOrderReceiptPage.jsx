import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import PurchaseOrderReceiptTable from '../components/purchaseOrderReceiptTable';
import ReceiptFeedback from '../components/ReceiptFeedback';
import ReceiptSummary from '../components/ReceiptSummary';
import ReceiptWorkspaceHeader from '../components/ReceiptWorkspaceHeader';
import usePurchaseOrderReceiptStore from '../store/purchaseOrderReceiptStore';

const ListPurchaseOrderReceiptPage = () => {
  const { shopSlug } = useParams();
  const store = usePurchaseOrderReceiptStore();

  const purchaseOrders = store?.purchaseOrdersForReceipt || [];
  const loading = store?.loading || false;
  const error = store?.error || null;
  const clearErrorAction = store?.clearErrorAction;
  const fetchAction =
    store?.fetchPurchaseOrdersForReceiptAction || store?.fetchPurchaseOrdersForReceipt;

  useEffect(() => {
    if (typeof clearErrorAction === 'function') {
      clearErrorAction();
    }

    if (typeof fetchAction === 'function') {
      fetchAction({ shopSlug: shopSlug || 'advancetech' });
    } else {
      console.warn('ไม่พบฟังก์ชันดึงใบสั่งซื้อที่รอตรวจรับใน Store');
    }
  }, [clearErrorAction, fetchAction, shopSlug]);

  return (
    <div className="mx-auto w-full max-w-[1680px] space-y-4 px-0 py-1 text-slate-800 animate-fadeIn sm:space-y-5">
      <ReceiptWorkspaceHeader loading={loading} shopSlug={shopSlug} />
      <ReceiptSummary purchaseOrders={purchaseOrders} />
      <ReceiptFeedback error={error} onDismiss={clearErrorAction} />
      <PurchaseOrderReceiptTable
        purchaseOrders={Array.isArray(purchaseOrders) ? purchaseOrders : []}
        loading={loading}
      />
    </div>
  );
};

export default ListPurchaseOrderReceiptPage;
