

// PurchaseOrderListPage.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

import StandardActionButtons from '@/components/shared/buttons/StandardActionButtons';
import usePurchaseOrderStore from '../store/purchaseOrderStore';
import PurchaseOrderListTable from '../components/purchaseOrderListTable';

const PurchaseOrderListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isFirstRunRef = useRef(true);

  const { purchaseOrders, fetchAllPurchaseOrders, loading } = usePurchaseOrderStore();

  // ✅ Single source of fetching logic (avoid double-fetch on mount)
  // - first run: fetch immediately
  // - subsequent changes: debounce to reduce request spam
  useEffect(() => {
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      fetchAllPurchaseOrders({ search: searchTerm });
      return undefined;
    }

    const t = window.setTimeout(() => {
      fetchAllPurchaseOrders({ search: searchTerm });
    }, 300);

    return () => window.clearTimeout(t);
  }, [searchTerm, fetchAllPurchaseOrders]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex gap-4 flex-wrap items-center">
          <Input
            placeholder="ค้นหาใบสั่งซื้อ หรือชื่อ Supplier"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[250px]"
          />
        </div>

        <StandardActionButtons showCreate onAdd={() => navigate('/pos/purchases/orders/create')} />
      </div>

      <div>
        <PurchaseOrderListTable
          purchaseOrders={Array.isArray(purchaseOrders) ? purchaseOrders : []}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderListPage;


