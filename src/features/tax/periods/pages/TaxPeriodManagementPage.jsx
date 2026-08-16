import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCheck2, LockKeyhole, RotateCcw } from 'lucide-react';
import { ConfirmActionDialog, feedback as toast } from '@/design-system';
import { useBranchStore } from '@/features/branch/store/branchStore';
import {
  ensureMonthlyTaxPeriod,
  getTaxPeriodErrorMessage,
  getTaxPeriodSummary,
  listTaxPeriods,
  transitionTaxPeriod,
} from '../api/taxPeriodApi';
import TaxPeriodDetailPanel from '../detail/TaxPeriodDetailPanel';
import TaxPeriodListFilters from '../list/TaxPeriodListFilters';
import TaxPeriodCurrentPeriodCard from '../workspace/components/TaxPeriodCurrentPeriodCard';
import TaxPeriodListTable from '../workspace/components/TaxPeriodListTable';
import TaxPeriodWorkspaceHeader from '../workspace/components/TaxPeriodWorkspaceHeader';
import TaxPeriodWorkspaceSummary from '../workspace/components/TaxPeriodWorkspaceSummary';

const STATUS_META = {
  OPEN: { label: 'เปิดใช้งาน', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'ปิดรอบแล้ว', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  LOCKED: { label: 'ล็อกแล้ว', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  SUBMITTED: { label: 'ยื่นแล้ว', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  REOPENED: { label: 'เปิดใหม่', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const ACTION_META = {
  CLOSE: { label: 'ปิดรอบภาษี', icon: CheckCircle2, confirm: 'ยืนยันการปิดรอบภาษีนี้หรือไม่?' },
  LOCK: { label: 'ล็อกรอบภาษี', icon: LockKeyhole, confirm: 'ยืนยันการล็อกรอบภาษีนี้หรือไม่? หลังล็อกจะไม่ควรแก้ไขข้อมูลย้อนหลัง' },
  SUBMIT: { label: 'ยื่นรอบภาษี', icon: FileCheck2, confirm: 'ยืนยันว่ารอบภาษีนี้ยื่นเรียบร้อยแล้วหรือไม่?' },
  REOPEN: { label: 'เปิดรอบอีกครั้ง', icon: RotateCcw, confirm: 'ยืนยันการเปิดรอบภาษีนี้กลับมาแก้ไขอีกครั้งหรือไม่?' },
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const renderStatus = (status) => {
  const meta = STATUS_META[status] || { label: status || '-', className: 'bg-slate-50 text-slate-600 border-slate-200' };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>;
};

const TaxPeriodManagementPage = () => {
  const [pendingAction, setPendingAction] = useState(null);
  const selectedBranchId = useBranchStore((state) => state.selectedBranchId);
  const currentBranch = useBranchStore((state) => state.currentBranch);
  const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);

  const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;
  const [summary, setSummary] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const mutationRef = useRef(false);

  const loadData = useCallback(async ({ reportError = true } = {}) => {
    if (!branchId) return { ok: false, skipped: true };
    setLoading(true);
    setError('');
    try {
      const [summaryResult, listResult] = await Promise.all([
        getTaxPeriodSummary({ branchId }),
        listTaxPeriods({
          branchId,
          status: statusFilter || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        }),
      ]);
      setSummary(summaryResult || null);
      setPeriods(Array.isArray(listResult?.periods) ? listResult.periods : []);
      return { ok: true };
    } catch (requestError) {
      const message = getTaxPeriodErrorMessage(requestError);
      setError(message);
      if (reportError) toast.error(message);
      return { ok: false, error: requestError, message };
    } finally {
      setLoading(false);
    }
  }, [branchId, fromDate, statusFilter, toDate]);

  useEffect(() => {
    if (!branchId) {
      Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});
      return;
    }
    loadData();
  }, [branchId, ensureSelectedBranchAction, loadData]);

  useEffect(() => {
    setSelectedPeriodId(null);
    setStatusFilter('');
    setSearchText('');
    setFromDate('');
    setToDate('');
  }, [branchId]);

  const totals = useMemo(() => summary?.countsByStatus || {}, [summary]);
  const statusOptions = useMemo(
    () => Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
    [],
  );
  const visiblePeriods = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return periods;
    return periods.filter((period) => String(period?.periodCode || '').toLowerCase().includes(keyword));
  }, [periods, searchText]);

  const interactionBusy = Boolean(busyKey) || mutationRef.current;

  const handleResetFilters = () => {
    if (interactionBusy) return;
    setStatusFilter('');
    setSearchText('');
    setFromDate('');
    setToDate('');
  };

  const handleRefresh = () => {
    if (mutationRef.current) return;
    return loadData();
  };

  const handleEnsureCurrentPeriod = async () => {
    if (!branchId || interactionBusy) return;

    const targetBranchId = branchId;
    mutationRef.current = true;
    setBusyKey('ensure');
    try {
      const result = await ensureMonthlyTaxPeriod({ branchId: targetBranchId });
      toast.actionSuccess(
        result?.created ? 'สร้างรอบภาษีประจำเดือนเรียบร้อยแล้ว' : 'รอบภาษีประจำเดือนนี้มีอยู่แล้ว',
        'tax-period:ensure-current:success',
      );
      const refresh = await loadData({ reportError: false });
      if (!refresh.ok) {
        toast.warning('บันทึกรอบภาษีสำเร็จแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณากดโหลดใหม่');
      }
    } catch (requestError) {
      toast.actionError(
        requestError,
        getTaxPeriodErrorMessage(requestError),
        'tax-period:ensure-current:error',
      );
    } finally {
      mutationRef.current = false;
      setBusyKey('');
    }
  };

  const handleAction = (period, action) => {
    const meta = ACTION_META[action];
    if (!meta || interactionBusy || pendingAction) return false;
    setPendingAction({ period, action });
    return false;
  };

  const confirmAction = async () => {
    if (!pendingAction || interactionBusy) return false;
    const { period, action } = pendingAction;
    const targetBranchId = branchId;
    const taxPeriodId = period.id;
    const occurredAt = new Date().toISOString();

    const key = `${taxPeriodId}:${action}`;
    mutationRef.current = true;
    setBusyKey(key);
    try {
      const result = await transitionTaxPeriod({
        branchId: targetBranchId,
        taxPeriodId,
        action,
        occurredAt,
      });
      toast.actionSuccess(
        result?.replayed ? 'สถานะนี้ถูกบันทึกไว้แล้ว' : 'อัปเดตสถานะรอบภาษีเรียบร้อยแล้ว',
        `tax-period:${taxPeriodId}:${action}:success`,
      );
      const refresh = await loadData({ reportError: false });
      if (!refresh.ok) {
        toast.warning('อัปเดตสถานะรอบภาษีสำเร็จแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณากดโหลดใหม่');
      }
      setPendingAction(null);
      return true;
    } catch (requestError) {
      toast.actionError(
        requestError,
        getTaxPeriodErrorMessage(requestError),
        `tax-period:${taxPeriodId}:${action}:error`,
      );
      return false;
    } finally {
      mutationRef.current = false;
      setBusyKey('');
    }
  };

  if (!branchId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        <div className="flex items-center gap-3"><AlertTriangle /><span className="font-bold">กรุณาเลือกสาขาก่อนจัดการรอบภาษี</span></div>
      </div>
    );
  }

  return (
    <>
      <section className="space-y-5">
        <TaxPeriodWorkspaceHeader
          branchName={currentBranch?.name}
          branchId={branchId}
          loading={loading}
          busyKey={busyKey}
          onRefresh={handleRefresh}
          onEnsureCurrentPeriod={handleEnsureCurrentPeriod}
        />

        <TaxPeriodWorkspaceSummary summary={summary} totals={totals} />

        <TaxPeriodCurrentPeriodCard
          currentPeriod={summary?.currentPeriod}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          renderStatus={renderStatus}
          onOpen={(periodId) => {
            if (!interactionBusy) setSelectedPeriodId(periodId);
          }}
        />

        <TaxPeriodListTable
          periods={periods}
          visiblePeriods={visiblePeriods}
          loading={loading}
          busyKey={busyKey}
          renderStatus={renderStatus}
          actionMeta={ACTION_META}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          error={error}
          onOpen={(periodId) => {
            if (!interactionBusy) setSelectedPeriodId(periodId);
          }}
          onAction={handleAction}
          filtersSlot={(
            <TaxPeriodListFilters
              searchText={searchText}
              status={statusFilter}
              fromDate={fromDate}
              toDate={toDate}
              statusOptions={statusOptions}
              onSearchTextChange={(value) => !interactionBusy && setSearchText(value)}
              onStatusChange={(value) => !interactionBusy && setStatusFilter(value)}
              onFromDateChange={(value) => !interactionBusy && setFromDate(value)}
              onToDateChange={(value) => !interactionBusy && setToDate(value)}
              onReset={handleResetFilters}
            />
          )}
        />
      </section>

      {selectedPeriodId && (
        <TaxPeriodDetailPanel
          branchId={branchId}
          taxPeriodId={selectedPeriodId}
          busyKey={busyKey}
          onAction={handleAction}
          onClose={() => {
            if (!interactionBusy) setSelectedPeriodId(null);
          }}
        />
      )}
      <ConfirmActionDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? ACTION_META[pendingAction.action]?.label : ''}
        description={pendingAction ? ACTION_META[pendingAction.action]?.confirm : ''}
        confirmLabel="ยืนยันดำเนินการ"
        intent={pendingAction?.action === 'LOCK' ? 'destructive' : 'primary'}
        loading={Boolean(busyKey)}
        onConfirm={confirmAction}
        onClose={() => {
          if (!interactionBusy) setPendingAction(null);
        }}
      />
    </>
  );
};

export default TaxPeriodManagementPage;
