import { useEffect, useState } from 'react';

import { getPurchaseOrders } from '../api/purchaseOrderApi';

const pickPurchaseOrderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const usePurchaseOrderList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    let alive = true;

    const timer = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');

        const payload = await getPurchaseOrders({
          search: searchQuery,
          status: showAllHistory ? 'all' : 'PENDING,PARTIALLY_RECEIVED',
        });

        if (alive) setPurchaseOrders(pickPurchaseOrderList(payload));
      } catch (err) {
        if (!alive) return;
        console.error('[PO] load purchase order list failed:', err);
        setPurchaseOrders([]);
        setError(err?.message || 'ไม่สามารถเรียกข้อมูลใบสั่งซื้อได้');
      } finally {
        if (alive) setIsLoading(false);
      }
    }, 300);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery, showAllHistory]);

  return {
    purchaseOrders,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    showAllHistory,
    setShowAllHistory,
  };
};
