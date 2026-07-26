import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Eye,
  FileCheck2,
  LockKeyhole,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
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

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status || '-', className: 'bg-slate-50 text-slate-600 border-slate-200' };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>;
};

const SummaryCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value ?? 0}</p>
      </div>
      <div className="rounded-xl bg-slate-100 p-3 text-slate-600"><Icon size={20} /></div>
    </div>
  </div>
);

const TaxPeriodManagementPage = () => {
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

  const handleAction = async (period, action) => {
    const meta = ACTION_META[action];
    if (!meta || !window.confirm(meta.confirm)) return false;

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
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700"><ShieldCheck size={18} /> ระบบจัดการรอบภาษี</div>
            <h1 className="mt-1 text-2xl font-black text-slate-900">รอบภาษีของสาขา {currentBranch?.name || branchId}</h1>
            <p className="mt-1 text-sm text-slate-500">จัดการสถานะรอบภาษีจากกฎของระบบโดยตรง</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={loading || !!busyKey}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
            </button>
            <button
              type="button"
              onClick={handleEnsureCurrentPeriod}
              disabled={loading || !!busyKey}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <CalendarRange size={17} /> {busyKey === 'ensure' ? 'กำลังตรวจสอบ...' : 'เตรียมรอบเดือนปัจจุบัน'}
            </button>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <SummaryCard label="ทั้งหมด" value={summary?.total} icon={CalendarRange} />
          <SummaryCard label="เปิดใช้งาน" value={totals.OPEN} icon={CheckCircle2} />
          <SummaryCard label="ปิดรอบแล้ว" value={totals.CLOSED} icon={CheckCircle2} />
          <SummaryCard label="ล็อกแล้ว" value={totals.LOCKED} icon={LockKeyhole} />
          <SummaryCard label="ยื่นแล้ว" value={totals.SUBMITTED} icon={FileCheck2} />
          <SummaryCard label="เปิดใหม่" value={totals.REOPENED} icon={RotateCcw} />
        </div>

        {summary?.currentPeriod && (
          <button
            type="button"
            onClick={() => setSelectedPeriodId(summary.currentPeriod.id)}
            className="block w-full rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition hover:border-blue-300 hover:bg-blue-100/70"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">รอบภาษีปัจจุบัน</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-black text-slate-900">{summary.currentPeriod.periodCode}</h2>
                  <StatusBadge status={summary.currentPeriod.status} />
                </div>
                <p className="mt-1 text-sm text-slate-600">{formatDate(summary.currentPeriod.startDate)} – {formatDate(summary.currentPeriod.endDate)}</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700"><Eye size={16} /> ดูรายละเอียด · อัปเดตล่าสุด {formatDateTime(summary.currentPeriod.updatedAt)}</div>
            </div>
          </button>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-black text-slate-900">รายการรอบภาษี</h2>
              <p className="text-xs text-slate-500">แสดง {visiblePeriods.length} จาก {periods.length} รายการ</p>
            </div>
          </div>

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

          {error && <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">รอบภาษี</th>
                  <th className="px-4 py-3">ช่วงวันที่</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">เหตุการณ์ล่าสุด</th>
                  <th className="px-4 py-3 text-right">การทำงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">กำลังโหลดรอบภาษี...</td></tr>
                ) : visiblePeriods.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">ไม่พบรอบภาษีตามเงื่อนไขที่เลือก</td></tr>
                ) : visiblePeriods.map((period) => {
                  const actions = Array.isArray(period.availableActions) ? period.availableActions : [];
                  const latestEvent = period.submittedAt || period.lockedAt || period.reopenedAt || period.closedAt || period.updatedAt;
                  return (
                    <tr key={period.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-4 py-4"><div className="font-black text-slate-900">{period.periodCode}</div><div className="mt-1 text-xs text-slate-400">v{period.responseVersion || '1'}</div></td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(period.startDate)}<br />ถึง {formatDate(period.endDate)}</td>
                      <td className="px-4 py-4"><StatusBadge status={period.status} /></td>
                      <td className="px-4 py-4 text-slate-600">{formatDateTime(latestEvent)}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPeriodId(period.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Eye size={14} /> รายละเอียด
                          </button>
                          {actions.length === 0 ? <span className="inline-flex items-center text-xs font-semibold text-slate-400">ไม่มี Action ต่อ</span> : actions.map(({ action }) => {
                            const meta = ACTION_META[action];
                            if (!meta) return null;
                            const Icon = meta.icon;
                            const key = `${period.id}:${action}`;
                            return (
                              <button
                                key={action}
                                type="button"
                                onClick={() => handleAction(period, action)}
                                disabled={!!busyKey}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                              >
                                <Icon size={14} /> {busyKey === key ? 'กำลังบันทึก...' : meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
    </>
  );
};

export default TaxPeriodManagementPage;
