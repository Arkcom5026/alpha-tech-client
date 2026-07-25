import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { usePurchaseOrderList } from '../../hooks/usePurchaseOrderList';
import PurchaseOrderListFeedback from '../components/PurchaseOrderListFeedback';
import PurchaseOrderListTable from '../components/PurchaseOrderListTable';
import PurchaseOrderListToolbar from '../components/PurchaseOrderListToolbar';
import { projectPurchaseOrderListRows } from '../projections/purchaseOrderListRowProjection';

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const { shopSlug } = useParams();
  const targetSlug = shopSlug || 'advancetech';

  const {
    purchaseOrders,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    showAllHistory,
    setShowAllHistory,
  } = usePurchaseOrderList();

  const rows = useMemo(
    () => projectPurchaseOrderListRows(purchaseOrders),
    [purchaseOrders]
  );

  const orderPath = (action, id) =>
    `/${targetSlug}/pos/purchases/orders/${action}/${id}`;

  return (
    <div className="h-full w-full space-y-6 p-6 text-slate-800 animate-fadeIn">
      <PurchaseOrderListToolbar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showAllHistory={showAllHistory}
        onShowAllHistoryChange={setShowAllHistory}
        onCreate={() => navigate(`/${targetSlug}/pos/purchases/orders/create`)}
      />

      <PurchaseOrderListFeedback isLoading={isLoading} error={error} />

      <PurchaseOrderListTable
        rows={rows}
        isLoading={isLoading}
        onView={(id) => navigate(orderPath('view', id))}
        onEdit={(id) => navigate(orderPath('edit', id))}
        onPrint={(id) => navigate(orderPath('print', id))}
      />
    </div>
  );
}
