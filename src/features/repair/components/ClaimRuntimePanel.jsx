import React, { useMemo, useState } from 'react';
import { CLAIM_LABELS, CLAIM_TRANSITIONS, formatDateTime, formatMoney } from '../utils/repairRuntime';

const ClaimRuntimePanel = ({ claim, submitting, onTransition, onOpenRepair }) => {
  const [draft, setDraft] = useState({
    status: '',
    note: '',
    serviceProvider: '',
    externalClaimRef: '',
    trackingNumber: '',
    resolution: '',
    resolutionNote: '',
    replacementStockItemId: '',
    creditAmount: '',
  });

  const nextStatuses = useMemo(() => CLAIM_TRANSITIONS[claim.status] || [], [claim.status]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Claim Runtime</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{claim.claimNo}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {claim.stockItem?.product?.name || `Stock #${claim.stockItemId}`}
            </p>
          </div>
          <span className="w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
            {CLAIM_LABELS[claim.status] || claim.status}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Info label="Supplier" value={claim.supplier?.name} />
          <Info label="ศูนย์บริการ" value={claim.serviceProvider} />
          <Info label="Tracking" value={claim.trackingNumber} />
          <Info label="เลขอ้างอิง" value={claim.externalClaimRef} />
          <Info label="เปิดเมื่อ" value={formatDateTime(claim.openedAt)} />
          <Info label="ศูนย์รับเมื่อ" value={formatDateTime(claim.providerReceivedAt)} />
          <Info label="ปิดเมื่อ" value={formatDateTime(claim.resolvedAt)} />
          <Info label="เครดิต" value={formatMoney(claim.creditAmount)} />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-black text-slate-500">เหตุผลในการเคลม</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{claim.reason}</p>
        </div>

        {claim.repairJob?.id ? (
          <button
            type="button"
            onClick={() => onOpenRepair(claim.repairJob.id)}
            className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700"
          >
            เปิดใบงานซ่อม {claim.repairJob.jobNo}
          </button>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">เปลี่ยนสถานะเคลม</h3>
          {nextStatuses.length ? (
            <>
              <select
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">เลือกสถานะถัดไป</option>
                {nextStatuses.map((status) => (
                  <option key={status} value={status}>{CLAIM_LABELS[status] || status}</option>
                ))}
              </select>

              <input
                value={draft.serviceProvider}
                onChange={(event) => setDraft((current) => ({ ...current, serviceProvider: event.target.value }))}
                placeholder="ศูนย์บริการ"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={draft.externalClaimRef}
                onChange={(event) => setDraft((current) => ({ ...current, externalClaimRef: event.target.value }))}
                placeholder="เลขอ้างอิงภายนอก"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                value={draft.trackingNumber}
                onChange={(event) => setDraft((current) => ({ ...current, trackingNumber: event.target.value }))}
                placeholder="Tracking number"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
              />

              {draft.status === 'RESOLVED' ? (
                <>
                  <select
                    value={draft.resolution}
                    onChange={(event) => setDraft((current) => ({ ...current, resolution: event.target.value }))}
                    className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
                  >
                    <option value="">เลือกผลการเคลม</option>
                    <option value="REPAIRED">ซ่อมคืน</option>
                    <option value="REPLACED">เปลี่ยนสินค้าใหม่</option>
                    <option value="CREDITED">รับเครดิต</option>
                    <option value="REFUNDED">คืนเงิน</option>
                    <option value="RETURNED_UNCHANGED">ส่งคืนโดยไม่แก้ไข</option>
                    <option value="REJECTED">ปฏิเสธ</option>
                    <option value="WRITTEN_OFF">ตัดจำหน่าย</option>
                  </select>
                  <input
                    value={draft.replacementStockItemId}
                    onChange={(event) => setDraft((current) => ({ ...current, replacementStockItemId: event.target.value }))}
                    inputMode="numeric"
                    placeholder="Replacement StockItem ID"
                    className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                  <input
                    value={draft.creditAmount}
                    onChange={(event) => setDraft((current) => ({ ...current, creditAmount: event.target.value }))}
                    type="number"
                    min="0"
                    placeholder="Credit amount"
                    className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
                  />
                </>
              ) : null}

              <textarea
                rows={3}
                value={draft.note}
                onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                placeholder="หมายเหตุ"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
              <button
                type="button"
                disabled={!draft.status || submitting}
                onClick={() =>
                  onTransition({
                    ...draft,
                    replacementStockItemId: draft.replacementStockItemId
                      ? Number(draft.replacementStockItemId)
                      : null,
                    creditAmount: draft.creditAmount !== ''
                      ? Number(draft.creditAmount)
                      : null,
                    resolution: draft.resolution || null,
                  })
                }
                className="mt-3 rounded-xl bg-indigo-700 px-5 py-3 font-black text-white disabled:opacity-40"
              >
                บันทึกสถานะเคลม
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">รายการนี้อยู่ในสถานะปลายทางแล้ว</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Timeline</h3>
          <div className="mt-4 space-y-4">
            {(claim.events || []).length ? (
              claim.events.map((event) => (
                <div key={event.id} className="relative border-l-2 border-indigo-200 pl-4">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-indigo-600" />
                  <p className="font-black text-slate-900">
                    {CLAIM_LABELS[event.status] || event.status}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(event.occurredAt)}</p>
                  {event.note ? <p className="mt-2 text-sm text-slate-700">{event.note}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">ยังไม่มีเหตุการณ์</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value ?? '-'}</p>
  </div>
);

export default ClaimRuntimePanel;
