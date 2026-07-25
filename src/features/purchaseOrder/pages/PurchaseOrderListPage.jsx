import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import { usePurchaseOrderList } from '../hooks/usePurchaseOrderList';
import PurchaseOrderListTable from '../list/components/PurchaseOrderListTable';
import PurchaseOrderListToolbar from '../list/components/PurchaseOrderListToolbar';
import { projectPurchaseOrderListRows } from '../list/projections/purchaseOrderListRowProjection';

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

      {isLoading && (
        <div className="flex items-center gap-2 rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4 text-xs font-bold text-orange-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          กำลังโหลดข้อมูลใบสั่งซื้อ...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-black text-rose-600">
          ⚠️ {error}
        </div>
      )}

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
