

// src/features/customerReceipt/pages/CustomerReceiptListPage.jsx

import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';

import useCustomerReceiptStore from '../store/customerReceiptStore';
import CustomerReceiptSearchFilters from '../components/CustomerReceiptSearchFilters';
import CustomerReceiptSummaryCards from '../components/CustomerReceiptSummaryCards';
import CustomerReceiptTable from '../components/CustomerReceiptTable';

const CustomerReceiptListPage = () => {
  const didInitialLoadRef = useRef(false);

  const items = useCustomerReceiptStore((state) => state.items);
  const pagination = useCustomerReceiptStore((state) => state.pagination);
  const filters = useCustomerReceiptStore((state) => state.filters);
  const loading = useCustomerReceiptStore((state) => state.loading);
  const error = useCustomerReceiptStore((state) => state.error);
  const successMessage = useCustomerReceiptStore((state) => state.successMessage);
  const searchCustomerReceiptsAction = useCustomerReceiptStore(
    (state) => state.searchCustomerReceiptsAction
  );
  const setCustomerReceiptFiltersAction = useCustomerReceiptStore(
    (state) => state.setCustomerReceiptFiltersAction
  );
  const resetCustomerReceiptFiltersAction = useCustomerReceiptStore(
    (state) => state.resetCustomerReceiptFiltersAction
  );
  const clearCustomerReceiptMessagesAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptMessagesAction
  );

  useEffect(() => {
    if (didInitialLoadRef.current) return;

    didInitialLoadRef.current = true;
    searchCustomerReceiptsAction(filters).catch(() => {});
  }, [searchCustomerReceiptsAction]);

  useEffect(() => {
    return () => {
      clearCustomerReceiptMessagesAction();
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

  const handleFilterChange = (partialFilters = {}) => {
    setCustomerReceiptFiltersAction({
      ...partialFilters,
      page: 1,
    });
  };

  const handleSearch = async () => {
    await searchCustomerReceiptsAction({
      ...filters,
      page: 1,
    });
  };

  const handleReset = async () => {
    const nextLimit = Number(filters?.limit) || 20;

    resetCustomerReceiptFiltersAction();
    await searchCustomerReceiptsAction({
      keyword: '',
      status: '',
      customerId: '',
      paymentMethod: '',
      fromDate: '',
      toDate: '',
      page: 1,
      limit: nextLimit,
    });
  };

  const handlePageChange = async (nextPage) => {
    await searchCustomerReceiptsAction({
      ...filters,
      page: nextPage,
    });
  };

  const handleLimitChange = async (nextLimit) => {
    await searchCustomerReceiptsAction({
      ...filters,
      page: 1,
      limit: Number(nextLimit) || 20,
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">รายการรับชำระลูกหนี้</h1>
          <p className="text-sm text-gray-600">
            จัดการใบรับเงินลูกหนี้หน่วยงาน ตรวจสอบยอดคงเหลือ และติดตามการตัดชำระแต่ละบิล
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => searchCustomerReceiptsAction(filters).catch(() => {})}
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            รีเฟรช
          </button>

          <Link
            to="/pos/finance/customer-receipts/create"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            สร้างใบรับเงิน
          </Link>
        </div>
      </div>

      {!!error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!!successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <CustomerReceiptSummaryCards summary={summary} loading={loading} />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <CustomerReceiptSearchFilters
          filters={filters}
          loading={loading}
          onChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <CustomerReceiptTable
          items={items}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  );
};

export default CustomerReceiptListPage;














