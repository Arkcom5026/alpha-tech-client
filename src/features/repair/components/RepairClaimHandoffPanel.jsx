import React, { useEffect, useMemo, useState } from 'react';
import repairApi from '../api/repairApi';

const RepairClaimHandoffPanel = ({ job, submitting, onOpenClaim }) => {
  const activeClaim = useMemo(
    () => (job?.warrantyClaims || []).find((item) => !['RESOLVED', 'CANCELLED'].includes(item.status)),
    [job?.warrantyClaims]
  );
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
  const canCreate = Boolean(job?.id && (job.stockItemId || job.deviceId)) && !['DELIVERED', 'CLOSED', 'CANCELLED'].includes(workflowStatus);

  useEffect(() => {
    if (!canCreate || activeClaim) return;
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
  }, [activeClaim, canCreate, job?.id]);

  if (activeClaim) {
    return (
      <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Warranty Claim</p>
        <h3 className="mt-1 text-lg font-black text-indigo-950">รายการเคลมที่กำลังดำเนินการ</h3>
        <p className="mt-2 text-sm text-indigo-800">
          {activeClaim.claimNo || `Claim #${activeClaim.id}`} · {activeClaim.status}
        </p>
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
    if (!form.reason.trim()) return;
    await onOpenClaim({
      reason: form.reason.trim(),
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      serviceProvider: form.serviceProvider.trim() || null,
      externalClaimRef: form.externalClaimRef.trim() || null,
      trackingNumber: form.trackingNumber.trim() || null,
      note: form.note.trim() || null,
    });
  };

  return (
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-700">Warranty Handoff</p>
      <h3 className="mt-1 text-lg font-black text-indigo-950">ส่งต่อเป็นงานเคลม</h3>
      <p className="mt-1 text-sm text-indigo-800">
        ระบบจะตรวจแหล่งรับเข้าสินค้าและผู้จำหน่ายให้ก่อน เพื่อไม่ต้องกรอก Supplier ID เอง
      </p>

      {loading ? <p className="mt-4 text-sm text-indigo-700">กำลังตรวจข้อมูลผู้จำหน่าย...</p> : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}

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
                onChange={(event) => setForm((current) => ({ ...current, supplierId: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-indigo-200 bg-white px-4 py-3"
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
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
            placeholder="เหตุผลในการส่งเคลม *"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2"
          />
          <input
            value={form.serviceProvider}
            onChange={(event) => setForm((current) => ({ ...current, serviceProvider: event.target.value }))}
            placeholder="ศูนย์บริการ / ผู้ให้บริการ"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
          />
          <input
            value={form.externalClaimRef}
            onChange={(event) => setForm((current) => ({ ...current, externalClaimRef: event.target.value }))}
            placeholder="เลขอ้างอิงจากศูนย์ (ถ้ามี)"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3"
          />
          <input
            value={form.trackingNumber}
            onChange={(event) => setForm((current) => ({ ...current, trackingNumber: event.target.value }))}
            placeholder="เลขติดตามขนส่ง (ถ้ามี)"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2"
          />
          <textarea
            rows={2}
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
            placeholder="หมายเหตุเพิ่มเติม"
            className="rounded-xl border border-indigo-200 bg-white px-4 py-3 md:col-span-2"
          />
          <button
            type="button"
            disabled={submitting || !form.reason.trim()}
            onClick={submit}
            className="rounded-xl bg-indigo-700 px-5 py-3 font-black text-white md:col-span-2 disabled:opacity-40"
          >
            เปิดรายการเคลมจากงานซ่อม
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default RepairClaimHandoffPanel;
