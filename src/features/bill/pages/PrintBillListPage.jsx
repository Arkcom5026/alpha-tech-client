import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BILL_DOCUMENT_SEARCH_POLICY,
  useSaleDocumentSearch,
} from '@/features/sales/documents/search';
import { CONSOLIDATED_DOCUMENT_SOURCE_TYPE } from '@/features/combinedBilling/adapters/consolidatedDocumentAdapter';
import { issueSaleDeliveryNote } from '@/features/sales/documents/workspace/api/saleDocumentWorkspaceApi';
import { feedback } from '@/design-system/feedback';
import BillWorkspaceHeader from '../components/workspace/BillWorkspaceHeader';
import BillSearchToolbar from '../components/workspace/BillSearchToolbar';
import BillResultTable from '../components/workspace/BillResultTable';

const TAX_DOCUMENT_SOURCE_TYPE = 'TAX_DOCUMENT';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => Number(toNumber(value).toFixed(2)).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const createInitialDateRange = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 30);
  const pad = (value) => String(value).padStart(2, '0');
  return {
    fromDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    toDate: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
  };
};

const PrintBillListPage = () => {
  const navigate = useNavigate();
  const initialDateRange = useMemo(createInitialDateRange, []);
  const [keyword, setKeyword] = useState('');
  const [fromDate, setFromDate] = useState(initialDateRange.fromDate);
  const [toDate, setToDate] = useState(initialDateRange.toDate);
  const [printFormat, setPrintFormat] = useState('short');
  const [limit, setLimit] = useState(100);
  const [uiError, setUiError] = useState(null);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [deliveryBusyId, setDeliveryBusyId] = useState(null);

  const documentSearch = useSaleDocumentSearch({
    policy: BILL_DOCUMENT_SEARCH_POLICY,
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
        keyword,
        fromDate,
        toDate,
        limit: clampLimit(limit),
      });
    } catch (error) {
      setUiError(error?.message || 'ไม่สามารถค้นหารายการเอกสารขายได้');
    }
  }, [clampLimit, documentSearch.actions, fromDate, keyword, limit, toDate]);

  const getSortValue = (row, key) => {
    if (!row) return null;
    if (key === 'totalAmount') return toNumber(row?.grossAmount ?? row?.totalAmount);
    if (key === 'createdAt') return row.createdAt ? new Date(row.createdAt).getTime() : 0;
    return String(row?.[key] ?? '').toLowerCase();
  };

  const handleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }
    setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
  };

  const sortedRows = useMemo(() => [...documentSearch.rows].sort((left, right) => {
    const leftValue = getSortValue(left, sortKey);
    const rightValue = getSortValue(right, sortKey);
    if (leftValue === rightValue) return 0;
    const direction = sortDir === 'asc' ? 1 : -1;
    return leftValue > rightValue ? direction : -direction;
  }), [documentSearch.rows, sortDir, sortKey]);

  const handlePrint = (row) => {
    const sourceType = row.documentSourceType || 'SALE';
    const sourceId = row.documentSourceId ?? row.id;

    if (sourceType === TAX_DOCUMENT_SOURCE_TYPE) {
      navigate(`../tax-document/print/${sourceId}`);
      return;
    }

    const sourceQuery = sourceType === CONSOLIDATED_DOCUMENT_SOURCE_TYPE
      ? `?sourceType=${CONSOLIDATED_DOCUMENT_SOURCE_TYPE}&sourceId=${encodeURIComponent(sourceId)}`
      : '';

    navigate(printFormat === 'full'
      ? `../bill/print-full/${sourceId}${sourceQuery}`
      : `../bill/print-short/${sourceId}${sourceQuery}`);
  };

  const handleManageTaxDocument = useCallback((row) => {
    const taxDocumentId = row?.taxDocumentId ?? row?.documentSourceId;
    if (!taxDocumentId) return;
    navigate(`../../finance/tax-intake?taxDocumentId=${encodeURIComponent(taxDocumentId)}`);
  }, [navigate]);

  const handleDeliveryNote = useCallback(async (row) => {
    const sourceType = row?.documentSourceType || 'SALE';
    const sourceId = row?.documentSourceId ?? row?.id;
    if (!sourceId || sourceType === TAX_DOCUMENT_SOURCE_TYPE) return;

    if (sourceType === CONSOLIDATED_DOCUMENT_SOURCE_TYPE) {
      navigate(`../delivery-note/print/${sourceId}?sourceType=${CONSOLIDATED_DOCUMENT_SOURCE_TYPE}&sourceId=${encodeURIComponent(sourceId)}`);
      return;
    }

    if (row?.officialDocumentNumber) {
      navigate(`../delivery-note/print/${sourceId}`);
      return;
    }

    setDeliveryBusyId(sourceId);
    setUiError(null);
    try {
      const issued = await issueSaleDeliveryNote({ saleId: sourceId });
      const documentNumber = issued?.documentNumber || `Sale #${sourceId}`;
      feedback.actionSuccess(
        `สร้างใบส่งของ ${documentNumber} เรียบร้อย`,
        `sale:${sourceId}:delivery-note:issue:success`,
      );
      navigate(`../delivery-note/print/${sourceId}`);
    } catch (error) {
      const message = error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || 'ไม่สามารถสร้างใบส่งของได้';
      setUiError(message);
      feedback.actionError(error, message, `sale:${sourceId}:delivery-note:issue:error`);
    } finally {
      setDeliveryBusyId(null);
    }
  }, [navigate]);

  const errorMessage = uiError || documentSearch.error;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 text-slate-800 md:p-5">
      <BillWorkspaceHeader count={sortedRows.length} />

      <BillSearchToolbar
        keyword={keyword}
        onKeywordChange={setKeyword}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
        limit={limit}
        onLimitChange={setLimit}
        onLimitBlur={() => setLimit(clampLimit(limit))}
        printFormat={printFormat}
        onPrintFormatChange={setPrintFormat}
        onSearch={handleSearch}
        loading={documentSearch.loading}
      />

      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <BillResultTable
        rows={sortedRows}
        loading={documentSearch.loading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onPrint={handlePrint}
        onManageTaxDocument={handleManageTaxDocument}
        onDeliveryNote={handleDeliveryNote}
        deliveryBusyId={deliveryBusyId}
        formatMoney={formatMoney}
        lastSearchedAt={documentSearch.lastSearchedAt}
      />
    </div>
  );
};

export default PrintBillListPage;
