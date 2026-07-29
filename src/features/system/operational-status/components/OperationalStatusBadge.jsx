import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

import { getOperationalVerification } from '../api/operationalStatusApi';

const normalizeStatus = (value) => {
  const status = String(value || '').trim().toUpperCase();
  if (status === 'READY') return 'READY';
  if (status === 'WARNING') return 'WARNING';
  if (status === 'FAILED') return 'FAILED';
  return 'UNKNOWN';
};

const statusMeta = {
  READY: {
    label: 'ระบบพร้อมใช้งาน',
    icon: CheckCircle2,
    className: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-300',
  },
  WARNING: {
    label: 'ระบบมีคำเตือน',
    icon: AlertTriangle,
    className: 'border-amber-400/35 bg-amber-500/10 text-amber-300',
  },
  FAILED: {
    label: 'ระบบต้องตรวจสอบ',
    icon: XCircle,
    className: 'border-red-400/35 bg-red-500/10 text-red-300',
  },
  UNKNOWN: {
    label: 'ยังไม่ทราบสถานะ',
    icon: Activity,
    className: 'border-slate-400/30 bg-slate-500/10 text-slate-300',
  },
};

const OperationalStatusBadge = ({ enabled }) => {
  const [status, setStatus] = useState('UNKNOWN');
  const [summary, setSummary] = useState(null);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadStatus = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const data = await getOperationalVerification();
      setStatus(normalizeStatus(data?.status));
      setSummary(data?.summary || null);
      setChecks(Array.isArray(data?.checks) ? data.checks : []);
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      setStatus('FAILED');
      setSummary(null);
      setChecks([]);
      setErrorMessage(serverMessage || 'ไม่สามารถตรวจสอบความพร้อมของระบบได้');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) loadStatus();
  }, [enabled, loadStatus]);

  const meta = statusMeta[status] || statusMeta.UNKNOWN;
  const Icon = meta.icon;

  const visibleChecks = useMemo(
    () => checks.filter((check) => check && check.name).slice(0, 8),
    [checks],
  );

  if (!enabled) return null;

  return (
    <div className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 items-center gap-2 rounded-full border px-3 text-[10px] font-black uppercase tracking-[0.12em] transition hover:bg-white/10 ${meta.className}`}
        aria-expanded={open}
        aria-label="ดูสถานะความพร้อมของระบบ"
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{loading ? 'กำลังตรวจสอบ' : meta.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-[#7a5b21]/85 bg-slate-950/95 p-4 text-slate-100 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black">Operational Verification</p>
              <p className="mt-1 text-[11px] text-slate-400">ตรวจสอบ Production แบบอ่านอย่างเดียว</p>
            </div>
            <button
              type="button"
              onClick={loadStatus}
              disabled={loading}
              className="rounded-xl border border-amber-400/25 p-2 text-amber-300 transition hover:bg-amber-400/10 disabled:opacity-50"
              aria-label="ตรวจสอบสถานะอีกครั้ง"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {summary && (
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ['ทั้งหมด', summary.total],
                ['พร้อม', summary.ready],
                ['เตือน', summary.warning],
                ['ล้มเหลว', summary.failed],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                  <p className="text-sm font-black">{Number(value || 0)}</p>
                  <p className="text-[9px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {visibleChecks.length > 0 && (
            <div className="mt-4 space-y-2">
              {visibleChecks.map((check) => {
                const checkStatus = normalizeStatus(check.status);
                const CheckIcon = statusMeta[checkStatus]?.icon || Activity;
                return (
                  <div key={check.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span className="truncate text-xs font-bold">{check.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
                      <CheckIcon className="h-3.5 w-3.5" />
                      {checkStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OperationalStatusBadge;
