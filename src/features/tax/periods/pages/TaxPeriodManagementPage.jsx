import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

  const loadData = useCallback(async () => {
    if (!branchId) return;
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
    } catch (requestError) {
      const message = getTaxPeriodErrorMessage(requestError);
      setError(message);
      toast.error(message);
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

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearchText('');
    setFromDate('');
    setToDate('');
  };

  const handleEnsureCurrentPeriod = async () => {
    if (!branchId) return;
    setBusyKey('ensure');
    try {
      const result = await ensureMonthlyTaxPeriod({ branchId });
      toast.success(result?.created ? 'สร้างรอบภาษีประจำเดือนเรียบร้อยแล้ว' : 'รอบภาษีประจำเดือนนี้มีอยู่แล้ว');
      await loadData();
    } catch (requestError) {
      toast.error(getTaxPeriodErrorMessage(requestError));
    } finally {
      setBusyKey('');
    }
  };

  const handleAction = (period, action) => {
    const meta = ACTION_META[action];
    if (!meta) return false;
    setPendingAction({ period, action });
    return false;
  };

  const confirmAction = async () => {
    if (!pendingAction) return false;
    const { period, action } = pendingAction;

    const key = `${period.id}:${action}`;
    setBusyKey(key);
    try {
      const result = await transitionTaxPeriod({
        branchId,
        taxPeriodId: period.id,
        action,
        occurredAt: new Date().toISOString(),
      });
      toast.success(result?.replayed ? 'สถานะนี้ถูกบันทึกไว้แล้ว' : 'อัปเดตสถานะรอบภาษีเรียบร้อยแล้ว');
      await loadData();
      setPendingAction(null);
      return true;
    } catch (requestError) {
      toast.error(getTaxPeriodErrorMessage(requestError));
      return false;
    } finally {
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
          onRefresh={loadData}
          onEnsureCurrentPeriod={handleEnsureCurrentPeriod}
        />

        <TaxPeriodWorkspaceSummary summary={summary} totals={totals} />

        <TaxPeriodCurrentPeriodCard
          currentPeriod={summary?.currentPeriod}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          renderStatus={renderStatus}
          onOpen={setSelectedPeriodId}
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
          onOpen={setSelectedPeriodId}
          onAction={handleAction}
          filtersSlot={(
            <TaxPeriodListFilters
              searchText={searchText}
              status={statusFilter}
              fromDate={fromDate}
              toDate={toDate}
              statusOptions={statusOptions}
              onSearchTextChange={setSearchText}
              onStatusChange={setStatusFilter}
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
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
          onClose={() => setSelectedPeriodId(null)}
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
          if (!busyKey) setPendingAction(null);
        }}
      />
    </>
  );
};

export default TaxPeriodManagementPage;
