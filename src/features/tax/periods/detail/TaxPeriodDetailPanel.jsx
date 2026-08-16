import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  LockKeyhole,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import { feedback } from '@/design-system/feedback';
import { getTaxPeriodDetail, getTaxPeriodErrorMessage } from '../api/taxPeriodApi';

const STATUS_META = {
  OPEN: { label: 'เปิดใช้งาน', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'ปิดรอบแล้ว', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  LOCKED: { label: 'ล็อกแล้ว', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  SUBMITTED: { label: 'ยื่นแล้ว', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  REOPENED: { label: 'เปิดใหม่', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const ACTION_META = {
  CLOSE: { label: 'ปิดรอบภาษี', icon: CheckCircle2 },
  LOCK: { label: 'ล็อกรอบภาษี', icon: LockKeyhole },
  SUBMIT: { label: 'ยื่นรอบภาษี', icon: FileCheck2 },
  REOPEN: { label: 'เปิดรอบอีกครั้ง', icon: RotateCcw },
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

const TimelineItem = ({ label, value, icon, active }) => {
  const IconComponent = icon;
  return (
  <div className="flex gap-3">
    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
      <IconComponent size={15} />
    </div>
    <div className="min-w-0 pb-4">
      <p className={`text-sm font-bold ${active ? 'text-slate-800' : 'text-slate-400'}`}>{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(value)}</p>
    </div>
  </div>
  );
};

const TaxPeriodDetailPanel = ({ branchId, taxPeriodId, onClose, onAction, busyKey }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDetail = useCallback(async () => {
    if (!branchId || !taxPeriodId) return;
    setLoading(true);
    setError('');
    try {
      const result = await getTaxPeriodDetail({ branchId, taxPeriodId });
      setDetail(result?.taxPeriod || result || null);
    } catch (requestError) {
      const message = getTaxPeriodErrorMessage(requestError);
      setError(message);
      feedback.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchId, taxPeriodId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const actions = useMemo(
    () => (Array.isArray(detail?.availableActions) ? detail.availableActions : []),
    [detail],
  );
  const statusMeta = STATUS_META[detail?.status] || {
    label: detail?.status || '-',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const handleAction = async (action) => {
    if (!detail || !onAction || busyKey) return;
    const result = await onAction(detail, action);
    if (result !== false) await loadDetail();
  };

  const handleClose = () => {
    if (!busyKey) onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" role="dialog" aria-modal="true" aria-label="รายละเอียดรอบภาษี">
      <button type="button" className="min-w-0 flex-1 cursor-default" onClick={handleClose} disabled={!!busyKey} aria-label="ปิดรายละเอียด" />
      <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">รายละเอียดรอบภาษี</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{detail?.periodCode || 'กำลังโหลด...'}</h2>
          </div>
          <button type="button" onClick={handleClose} disabled={!!busyKey} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50" aria-label="ปิด">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm font-semibold text-slate-500">
              <RefreshCw size={18} className="mr-2 animate-spin" /> กำลังโหลดรายละเอียด...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
              <button type="button" onClick={loadDetail} className="ml-2 underline">ลองใหม่</button>
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">ช่วงรอบภาษี</p>
                    <p className="mt-1 font-black text-slate-900">
                      {formatDateTime(detail.startDate)} – {formatDateTime(detail.endDate)}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">สร้างเมื่อ</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{formatDateTime(detail.createdAt)}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-slate-500">แก้ไขล่าสุด</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{formatDateTime(detail.updatedAt)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Clock3 size={18} className="text-blue-600" />
                  <h3 className="font-black text-slate-900">Timeline สถานะ</h3>
                </div>
                <TimelineItem label="สร้างรอบภาษี" value={detail.createdAt} icon={CalendarDays} active={!!detail.createdAt} />
                <TimelineItem label="ปิดรอบภาษี" value={detail.closedAt} icon={CheckCircle2} active={!!detail.closedAt} />
                <TimelineItem label="เปิดรอบอีกครั้ง" value={detail.reopenedAt} icon={RotateCcw} active={!!detail.reopenedAt} />
                <TimelineItem label="ล็อกรอบภาษี" value={detail.lockedAt} icon={LockKeyhole} active={!!detail.lockedAt} />
                <TimelineItem label="ยื่นรอบภาษี" value={detail.submittedAt} icon={FileCheck2} active={!!detail.submittedAt} />
              </section>
            </div>
          ) : null}
        </div>

        <footer className="border-t border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={loadDetail} disabled={loading || !!busyKey} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
            </button>
            {actions.length === 0 ? (
              <span className="inline-flex items-center px-3 text-xs font-semibold text-slate-400">ไม่มี Action ต่อ</span>
            ) : actions.map(({ action }) => {
              const meta = ACTION_META[action];
              if (!meta) return null;
              const Icon = meta.icon;
              const key = `${detail.id}:${action}`;
              return (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleAction(action)}
                  disabled={!!busyKey}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  <Icon size={16} /> {busyKey === key ? 'กำลังบันทึก...' : meta.label}
                </button>
              );
            })}
          </div>
        </footer>
      </aside>
    </div>
  );
};

export default TaxPeriodDetailPanel;