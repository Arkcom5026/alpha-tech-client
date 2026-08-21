import { useEffect, useMemo, useState } from 'react';
import { History, X } from 'lucide-react';

import {
  loadDeliveryNoteRevisionDetail,
  loadDeliveryNoteRevisionHistory,
} from '../../api/deliveryNoteListLifecycleApi';

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 });
const formatDate = (value) => value ? new Date(value).toLocaleDateString('th-TH') : '-';

const revisionKindLabel = (kind) => {
  if (String(kind || '').toUpperCase() === 'RETURN_ADJUSTMENT') return 'ฉบับปรับหลังคืนสินค้า';
  return 'ฉบับเดิม';
};

const revisionStateMeta = (state) => {
  const normalized = String(state || '').toUpperCase();
  if (normalized === 'CURRENT') return { label: 'ฉบับปัจจุบัน', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
  if (normalized === 'SUPERSEDED') return { label: 'มีฉบับใหม่แทนแล้ว', className: 'border-amber-200 bg-amber-50 text-amber-700' };
  if (normalized === 'CANCELLED') return { label: 'ยกเลิก', className: 'border-rose-200 bg-rose-50 text-rose-700' };
  if (normalized === 'CONSOLIDATED') return { label: 'นำไปรวมเอกสารแล้ว', className: 'border-slate-200 bg-slate-50 text-slate-600' };
  return { label: normalized || '-', className: 'border-slate-200 bg-slate-50 text-slate-600' };
};

const DeliveryNoteHistoryDialog = ({ open, row, onClose }) => {
  const saleId = row?.documentSourceId ?? row?.id ?? null;
  const [history, setHistory] = useState(null);
  const [selectedRevisionId, setSelectedRevisionId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !saleId) {
      setHistory(null);
      setSelectedRevisionId(null);
      setDetail(null);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    loadDeliveryNoteRevisionHistory({ saleId })
      .then((next) => {
        if (!active) return;
        setHistory(next || null);
        const revisions = Array.isArray(next?.revisions) ? next.revisions : [];
        const initial = revisions.find((revision) => !revision.currentAuthority) || revisions[0] || null;
        setSelectedRevisionId(initial?.id || null);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถโหลดประวัติใบส่งของได้');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, saleId]);

  useEffect(() => {
    if (!open || !saleId || !selectedRevisionId) {
      setDetail(null);
      return;
    }

    let active = true;
    setDetailLoading(true);
    setError('');
    loadDeliveryNoteRevisionDetail({ saleId, revisionId: selectedRevisionId })
      .then((next) => {
        if (active) setDetail(next || null);
      })
      .catch((requestError) => {
        if (!active) return;
        setDetail(null);
        setError(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถโหลดรายละเอียดใบส่งของฉบับนี้ได้');
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, saleId, selectedRevisionId]);

  const revisions = useMemo(() => Array.isArray(history?.revisions) ? history.revisions : [], [history]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-label="ประวัติใบส่งของ"
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-slate-950">
              <History className="h-5 w-5 text-teal-700" /> ประวัติใบส่งของ
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {row?.code || '-'} · เอกสารเดิมทุกฉบับถูกเก็บเป็นหลักฐานแบบอ่านอย่างเดียว
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="ปิด">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 md:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-y-auto border-b border-slate-200 bg-slate-50/70 p-4 md:border-b-0 md:border-r">
            {loading ? <div className="text-sm text-slate-500">กำลังโหลดประวัติเอกสาร...</div> : null}
            {!loading && revisions.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">ยังไม่มี revision ที่บันทึกไว้</div>
            ) : null}
            <div className="space-y-2">
              {revisions.map((revision) => {
                const stateMeta = revisionStateMeta(revision.state);
                const selected = Number(selectedRevisionId) === Number(revision.id);
                return (
                  <button
                    key={revision.id}
                    type="button"
                    onClick={() => setSelectedRevisionId(revision.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${selected ? 'border-teal-300 bg-teal-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">R{revision.revisionNumber} · {revisionKindLabel(revision.revisionKind)}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${stateMeta.className}`}>{stateMeta.label}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{revision.documentNumber || '-'}</div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">วันที่ {formatDate(revision.issuedAt)}</span>
                      <span className="font-semibold tabular-nums text-slate-800">฿{formatMoney(revision.activeAmount)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-5">
            {error ? (
              <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>
            ) : null}
            {detailLoading ? <div className="text-sm text-slate-500">กำลังโหลดรายละเอียดฉบับที่เลือก...</div> : null}
            {!detailLoading && detail ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">{detail.documentNumber || '-'}</div>
                      <div className="mt-1 text-sm text-slate-500">R{detail.revisionNumber} · {revisionKindLabel(detail.revisionKind)} · วันที่ {formatDate(detail.issuedAt)}</div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${revisionStateMeta(detail.state).className}`}>
                      {revisionStateMeta(detail.state).label}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-500">ยอดเดิม</div><div className="mt-1 font-semibold tabular-nums">฿{formatMoney(detail.grossAmount)}</div></div>
                    <div className="rounded-xl bg-amber-50 p-3"><div className="text-xs text-amber-700">คืนแล้ว</div><div className="mt-1 font-semibold tabular-nums text-amber-800">฿{formatMoney(detail.returnedAmount)}</div></div>
                    <div className="rounded-xl bg-emerald-50 p-3"><div className="text-xs text-emerald-700">ยอดเอกสารฉบับนี้</div><div className="mt-1 font-semibold tabular-nums text-emerald-800">฿{formatMoney(detail.activeAmount)}</div></div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs font-semibold text-slate-600">
                      <tr>
                        <th className="px-3 py-2 text-left">รายการ</th>
                        <th className="px-3 py-2 text-right">จำนวนเดิม</th>
                        <th className="px-3 py-2 text-right">คืน</th>
                        <th className="px-3 py-2 text-right">คงเหลือ</th>
                        <th className="px-3 py-2 text-right">ราคา/หน่วย</th>
                        <th className="px-3 py-2 text-right">จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(detail.lines || []).map((line) => (
                        <tr key={line.id}>
                          <td className="px-3 py-2 font-medium text-slate-800">{line.description || 'สินค้า'}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatMoney(line.originalQuantity)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-amber-700">{formatMoney(line.returnedQuantity)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatMoney(line.activeQuantity)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{formatMoney(line.unitAmount)}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums">{formatMoney(line.activeAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!detail.currentAuthority ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    ฉบับนี้เป็นหลักฐานย้อนหลังและไม่สามารถแก้ไขรายการ ยอดเงิน หรือสถานะทางธุรกิจได้
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeliveryNoteHistoryDialog;
