import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  DELIVERY_NOTE_SEARCH_POLICY,
  useSaleDocumentSearch,
} from '@/features/sales/documents/search';
import DeliveryNoteWorkspaceHeader from '../components/workspace/DeliveryNoteWorkspaceHeader';
import DeliveryNoteSearchToolbar from '../components/workspace/DeliveryNoteSearchToolbar';
import DeliveryNoteMetricGrid from '../components/workspace/DeliveryNoteMetricGrid';
import DeliveryNoteResultTable from '../components/workspace/DeliveryNoteResultTable';

const createInitialDateRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30);
  const pad2 = (value) => String(value).padStart(2, '0');

  return {
    fromDate: `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`,
    toDate: `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`,
  };
};

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

const DeliveryNoteListPage = () => {
  const navigate = useNavigate();
  const initialDateRange = useMemo(createInitialDateRange, []);

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [limit, setLimit] = useState(100);
  const [uiError, setUiError] = useState(null);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const documentSearch = useSaleDocumentSearch({
    policy: DELIVERY_NOTE_SEARCH_POLICY,
    initialQuery: {
      keyword: '',
      fromDate: initialDateRange.fromDate,
      toDate: initialDateRange.toDate,
      limit: 100,
    },
  });

  const clampLimit = useCallback((value) => {
    const parsed = parseInt(value, 10);
    const safe = Number.isFinite(parsed) ? parsed : 100;
    return Math.min(Math.max(safe, 1), 500);
  }, []);

  const handleSearch = useCallback(async () => {
    setUiError(null);
    documentSearch.actions.clearError?.();

    if (fromDate && toDate && fromDate > toDate) {
      setUiError('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');
      return;
    }

    try {
      await documentSearch.actions.search({
        keyword: search,
        fromDate,
        toDate,
        limit: clampLimit(limit),
      });
    } catch (error) {
      setUiError(error?.message || 'ไม่สามารถค้นหาใบส่งสินค้าได้');
    }
  }, [clampLimit, documentSearch.actions, fromDate, limit, search, toDate]);

  const getSortValue = (row, key) => {
    if (!row) return null;
    if (['totalAmount', 'paidAmount', 'balanceAmount', 'agingDays'].includes(key)) {
      return Number(row[key] || 0);
    }
    if (key === 'createdAt' || key === 'lastPaidAt') {
      return row[key] ? new Date(row[key]).getTime() : 0;
    }
    return String(row[key] ?? '').toLowerCase();
  };

  const toggleSort = (key) => {
    if (!key) return;
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  const sortedRows = useMemo(() => {
    return [...documentSearch.rows].sort((left, right) => {
      const leftValue = getSortValue(left, sortKey);
      const rightValue = getSortValue(right, sortKey);
      if (leftValue === rightValue) return 0;
      const direction = sortDir === 'asc' ? 1 : -1;
      return leftValue > rightValue ? direction : -direction;
    });
  }, [documentSearch.rows, sortDir, sortKey]);

  const summary = useMemo(() => {
    const count = sortedRows.length;
    const totalSum = round2(sortedRows.reduce((sum, row) => sum + Number(row?.totalAmount || 0), 0));
    const balanceSum = round2(sortedRows.reduce((sum, row) => sum + Number(row?.balanceAmount || 0), 0));

    return {
      count,
      totalSum,
      balanceSum,
      avg: count > 0 ? round2(totalSum / count) : 0,
    };
  }, [sortedRows]);

  const error = uiError || documentSearch.error;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-4 p-3 text-slate-800 md:p-5">
      <DeliveryNoteWorkspaceHeader
        title="ใบส่งสินค้าและยอดค้างชำระ"
        description="ค้นหา ตรวจสอบ และพิมพ์ใบส่งสินค้าจากรายการขายเครดิต"
        count={sortedRows.length}
      />

      <DeliveryNoteSearchToolbar
        search={search}
        onSearchChange={(event) => setSearch(event.target.value)}
        fromDate={fromDate}
        onFromDateChange={(event) => setFromDate(event.target.value)}
        toDate={toDate}
        onToDateChange={(event) => setToDate(event.target.value)}
        limit={limit}
        onLimitChange={(event) => setLimit(event.target.value)}
        onLimitBlur={() => setLimit(clampLimit(limit))}
        onSearch={handleSearch}
        loading={documentSearch.loading}
      />

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <DeliveryNoteMetricGrid summary={summary} />

      <DeliveryNoteResultTable
        rows={sortedRows}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
        onPrint={(row) => navigate(`print/${row.id}`)}
      />

      <p className="text-xs text-slate-500">
        แสดงเฉพาะรายการที่เข้าเงื่อนไขสำหรับออกใบส่งสินค้าตามข้อมูลจากระบบขาย
      </p>
    </main>
  );
};

export default DeliveryNoteListPage;
