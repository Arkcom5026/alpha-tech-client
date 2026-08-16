import React, { useEffect, useMemo, useState } from 'react';
import repairApi from '../api/repairApi';

const CLAIM_OPENABLE_WORKFLOW_STATUSES = new Set([
  'DIAGNOSING',
  'WAITING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'REPAIRING',
  'WAITING_PARTS',
  'WAITING_QC',
  'QC_FAILED',
]);

const RepairClaimHandoffPanel = ({ job, submitting, onOpenClaim }) => {
  const activeClaim = useMemo(
    () => (job?.warrantyClaims || []).find((item) => !['RESOLVED', 'CANCELLED'].includes(item.status)),
    [job?.warrantyClaims]
  );
  const [expanded, setExpanded] = useState(false);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    reason: '',
    supplierId: '',
    serviceProvider: '',
    externalClaimRef: '',
    trackingNumber: '',
    note: '',
  });

  const workflowStatus = job?.workflow?.status || 'RECEIVED';
  const canCreate = Boolean(job?.id && (job.stockItemId || job.deviceId))
    && CLAIM_OPENABLE_WORKFLOW_STATUSES.has(workflowStatus);

  useEffect(() => {
    if (!expanded || !canCreate || activeClaim || options) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    repairApi.getClaimOptions(job.id)
      .then((data) => {
        if (cancelled) return;
        setOptions(data);
        if (data?.supplierSelectionMode === 'SOURCE_LOCKED' && data?.sourceSupplierId) {
          setForm((current) => ({ ...current, supplierId: String(data.sourceSupplierId) }));
        }
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeClaim, canCreate, expanded, job?.id, options]);

  if (activeClaim) {
    return (
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Warranty Claim</p>
        <h3 className="mt-1 text-lg font-black text-indigo-950">รายการเคลมที่กำลังดำเนินการ</h3>
        <p className="mt-2 text-sm text-indigo-800">
          {activeClaim.claimNo || `Claim #${activeClaim.id}`} · {activeClaim.status}
        </p>
        <p className="mt-2 text-sm text-indigo-700">ใบงานซ่อมถูกพักไว้จนกว่ารายการเคลมนี้จะจบ</p>
        <button
          type="button"
          onClick={() => onOpenClaim(activeClaim.id)}
          className="mt-4 rounded-xl bg-indigo-700 px-5 py-3 font-black text-white"
        >
          เปิดรายละเอียดเคลม
        </button>
      </section>
    );
  }

  if (!canCreate) return null;

  const suppliers = options?.suppliers || [];
  const sourceLocked = options?.supplierSelectionMode === 'SOURCE_LOCKED';
  const selectedSupplier = suppliers.find((item) => String(item.id) === String(form.supplierId));

  const submit = async () => {
    if (submitting || !form.reason.trim()) return;
    setError('');
    const created = await onOpenClaim({
      reason: form.reason.trim(),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      serviceProvider: form.serviceProvider.trim() || null,
      externalClaimRef: form.externalClaimRef.trim() || null,
      trackingNumber: form.trackingNumber.trim() || null,
      note: form.note.trim() || null,
    });
    if (!created) {
      setError('เปิดรายการเคลมไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง');
    }
  };

  if (!expanded) {
    return (
      <section className="rounded-2xl border border-dashed border-indigo-200 bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Optional Path</p>
        <h3 className="mt-1 text-lg font-black text-slate-950">ต้องส่งเคลมแทนการซ่อมในร้านหรือไม่?</h3>
        <p className="mt-1 text-sm text-slate-600">
          ขั้นตอนนี้ไม่บังคับ หากร้านซ่อมเองให้ดำเนิน Repair Workflow ตามปกติจน QC และส่งมอบได้เลย
        </p>
        <button
          type="button"
          disabled={submitting}
          onClick={() => setExpanded(true)}
          className="mt-4 rounded-xl border border-indigo-300 bg-indigo-50 px-5 py-3 font-black text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          เปิดขั้นตอนส่งเคลม
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Warranty Handoff · Optional</p>
          <h3 className="mt-1 text-lg font-black text-indigo-950">ส่งต่อเป็นงานเคลม</h3>
          <p className="mt-1 text-sm text-indigo-800">
            เลือกทางนี้เฉพาะเมื่ออุปกรณ์ต้องส่งผู้จำหน่ายหรือศูนย์ ระบบจะพัก Repair Workflow หลังเปิดเคลมสำเร็จ
          </p>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={() => setExpanded(false)}
          className="w-fit rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-black text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ซ่อนขั้นตอนเคลม
        </button>
      </div>

      {loading ? <p className="mt-4 text-sm text-indigo-700">กำลังตรวจข้อมูลผู้จำหน่าย...</p> : null}
      {error ? (
        <div className="mt-4 rounded-xl bg-red-50 p-3">
          <p className="text-sm font-bold text-red-700">{error}</p>
          {!submitting ? (
            <button
              type="button"
              onClick={() => { setOptions(null); setExpanded(false); setTimeout(() => setExpanded(true), 0); }}
              className="mt-2 text-xs font-black text-red-700 underline"
            >
              ลองโหลดใหม่
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="text-xs font-black text-indigo-800">ผู้จำหน่าย / แหล่งเคลม</p>
            {sourceLocked ? (
              <div className="mt-2 rounded-xl border border-indigo-200 bg-white p-4">
                <p className="font-black text-slate-950">{selectedSupplier?.name || 'ผู้จำหน่ายจากประวัติรับเข้า'}</p>
                <p className="mt-1 text-xs text-slate-500">ล็อกจากประวัติการรับเข้าสินค้าเพื่อป้องกันส่งเคลมผิดผู้จำหน่าย</p>
              </div>
            ) : (
              <select
                value={form.supplierId}
                disabled={submitting}
                onChange={(event) => setForm((current) => ({ ...current, supplierId: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">ไม่ระบุผู้จำหน่าย / ส่งศูนย์โดยตรง</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            )}
          </div>

          <textarea
            rows={3}
            value={form.reason}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
            placeholder="เหตุผลในการส่งเคลม *"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <input
            value={form.serviceProvider}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, serviceProvider: event.target.value }))}
            placeholder="ศูนย์บริการ / ผู้ให้บริการ"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <input
            value={form.externalClaimRef}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, externalClaimRef: event.target.value }))}
            placeholder="เลขอ้างอิงจากศูนย์ (ถ้ามี)"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <input
            value={form.trackingNumber}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, trackingNumber: event.target.value }))}
            placeholder="เลขติดตามขนส่ง (ถ้ามี)"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <textarea
            rows={2}
            value={form.note}
            disabled={submitting}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="หมายเหตุเพิ่มเติม"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2 disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <button
            type="button"
            disabled={submitting || !form.reason.trim()}
            onClick={submit}
            className="rounded-xl bg-indigo-700 px-5 py-3 font-black text-white md:col-span-2 disabled:opacity-40"
          >
            {submitting ? 'กำลังเปิดรายการเคลม...' : 'ยืนยันเปิดรายการเคลมและพักงานซ่อม'}
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default RepairClaimHandoffPanel;
