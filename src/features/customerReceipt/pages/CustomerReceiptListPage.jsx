// src/features/customerReceipt/pages/CustomerReceiptListPage.jsx

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerReceiptListWorkspace from '../list/CustomerReceiptListWorkspace';
import useCustomerReceiptStore from '../store/customerReceiptStore';

const CustomerReceiptListPage = () => {
  const didInitialLoadRef = useRef(false);
  const navigate = useNavigate();

  const [keywordInput, setKeywordInput] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const items = useCustomerReceiptStore((state) => state.items) || [];
  const pagination = useCustomerReceiptStore((state) => state.pagination);
  const filters = useCustomerReceiptStore((state) => state.filters) || {};
  const loading = useCustomerReceiptStore((state) => state.loading) || false;
  const error = useCustomerReceiptStore((state) => state.error) || null;
  const successMessage = useCustomerReceiptStore((state) => state.successMessage) || null;

  const searchCustomerReceiptsAction = useCustomerReceiptStore((state) => state.searchCustomerReceiptsAction);
  const setCustomerReceiptFiltersAction = useCustomerReceiptStore((state) => state.setCustomerReceiptFiltersAction);
  const resetCustomerReceiptFiltersAction = useCustomerReceiptStore((state) => state.resetCustomerReceiptFiltersAction);
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore((state) => state.clearCustomerReceiptMessagesAction);

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    if (typeof searchCustomerReceiptsAction === 'function') {
      searchCustomerReceiptsAction(filters).catch(() => {});
    }
  }, [searchCustomerReceiptsAction, filters]);

  useEffect(() => {
    return () => {
      if (typeof clearCustomerReceiptMessagesAction === 'function') {
        clearCustomerReceiptMessagesAction();
      }
    };
  }, [clearCustomerReceiptMessagesAction]);

  const summary = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const totalAmount = Number(item?.totalAmount || 0);
        const allocatedAmount = Number(item?.allocatedAmount || 0);
        const remainingAmount = Number(item?.remainingAmount || 0);
        const status = item?.status || '';

        acc.totalReceipts += 1;
        acc.totalAmount += totalAmount;
        acc.totalAllocated += allocatedAmount;
        acc.totalRemaining += remainingAmount;

        if (status === 'FULLY_ALLOCATED') acc.fullyAllocatedCount += 1;
        if (status === 'CANCELLED') acc.cancelledCount += 1;
        if (status === 'ACTIVE') acc.activeCount += 1;

        return acc;
      },
      {
        totalReceipts: 0,
        totalAmount: 0,
        totalAllocated: 0,
        totalRemaining: 0,
        activeCount: 0,
        fullyAllocatedCount: 0,
        cancelledCount: 0,
      }
    );
  }, [items]);

  const handleSearch = async () => {
    if (typeof searchCustomerReceiptsAction === 'function') {
      await searchCustomerReceiptsAction({
        ...filters,
        keyword: keywordInput,
        page: 1,
      });
    }
  };

  const handleReset = async () => {
    setKeywordInput('');
    if (typeof resetCustomerReceiptFiltersAction === 'function') {
      resetCustomerReceiptFiltersAction();
    }
    if (typeof searchCustomerReceiptsAction === 'function') {
      await searchCustomerReceiptsAction({
        keyword: '',
        status: '',
        customerId: '',
        paymentMethod: '',
        fromDate: '',
        toDate: '',
        page: 1,
        limit: Number(filters?.limit) || 20,
      });
    }
  };

  const toggleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];

      if (sortKey === 'totalAmount' || sortKey === 'allocatedAmount' || sortKey === 'remainingAmount') {
        av = Number(av || 0);
        bv = Number(bv || 0);
      } else {
        av = String(av || '').toLowerCase();
        bv = String(bv || '').toLowerCase();
      }

      if (av === bv) return 0;
      const direction = sortDir === 'asc' ? 1 : -1;
      return av > bv ? direction : -direction;
    });
  }, [items, sortKey, sortDir]);

  const getDynamicFinanceUrl = (segment) => {
    const currentPath = window.location.pathname;
    const baseSalesPath = currentPath.substring(0, currentPath.indexOf('/finance'));
    return `${baseSalesPath}/finance/customer-receipts${segment}`;
  };

  const handleOpenDetail = (item) => navigate(getDynamicFinanceUrl(`/${item.id}`));
  const handleOpenReprint = (item) => navigate(getDynamicFinanceUrl(`/${item.id}/reprint`));

  // Keep store pagination/filter ownership explicit at the page controller boundary.
  // The current high-density workspace does not expose those controls yet.
  void pagination;
  void setCustomerReceiptFiltersAction;

  return (
    <CustomerReceiptListWorkspace
      keywordInput={keywordInput}
      onKeywordInputChange={setKeywordInput}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      error={error}
      successMessage={successMessage}
      summary={summary}
      sortedItems={sortedItems}
      sortKey={sortKey}
      sortDir={sortDir}
      onToggleSort={toggleSort}
      onOpenDetail={handleOpenDetail}
      onOpenReprint={handleOpenReprint}
    />
  );
};

export default CustomerReceiptListPage;
