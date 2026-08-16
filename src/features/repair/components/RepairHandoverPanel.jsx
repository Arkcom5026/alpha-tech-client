import React, { useEffect, useRef, useState } from 'react';
import { feedback } from '@/design-system';
import repairApi from '../api/repairApi';

const RepairHandoverPanel = ({ repairJobId, job, onWorkflowAction, onJobReload }) => {
  const workflowStatus = job?.workflow?.status || 'RECEIVED';
  const handoverRelevant = ['READY_FOR_DELIVERY', 'DELIVERED', 'CLOSED'].includes(workflowStatus);
  const defaultReceiverName = job?.customer?.name || job?.customer?.companyName || job?.customerName || '';
  const [handover, setHandover] = useState(null);
  const [form, setForm] = useState({ receiverName: defaultReceiverName, handoverConfirmed: false, note: '' });
  const [state, setState] = useState({ loading: false, saving: false, error: null });
  const savingRef = useRef(false);

  const load = () => {
    if (!handoverRelevant) return;
    setState((v) => ({ ...v, loading: true, error: null }));
    repairApi.getHandover(repairJobId)
      .then((data) => {
        setHandover(data);
        setForm((current) => ({
          ...current,
          receiverName: current.receiverName.trim() || data?.customerConfirmedBy || defaultReceiverName,
        }));
        setState({ loading: false, saving: false, error: null });
      })
      .catch((error) => setState({ loading: false, saving: false, error: error.message }));
  };

  useEffect(() => {
    if (!handoverRelevant) return;
    load();
  }, [repairJobId, handoverRelevant]);

  if (!handoverRelevant) return null;

  const finalizeAndClose = async () => {
    if (state.saving || savingRef.current) return;

    const repairJobIdSnapshot = repairJobId;
    const formSnapshot = { ...form };
    const handoverAlreadyConfirmed = Boolean(handover?.customerConfirmedAt);

    savingRef.current = true;
    setState((v) => ({ ...v, saving: true, error: null }));
    let handoverFinalized = false;
    try {
      const finalized = await repairApi.finalizeHandover(repairJobIdSnapshot, {
        receiverName: handoverAlreadyConfirmed ? undefined : formSnapshot.receiverName,
        handoverConfirmed: formSnapshot.handoverConfirmed,
        note: formSnapshot.note,
      });
      handoverFinalized = true;
      setHandover(finalized);

      if (onWorkflowAction) {
        const closed = await onWorkflowAction({
          action: 'CLOSE',
          expectedWorkflowStatus: 'DELIVERED',
          note: 'ปิดใบงานอัตโนมัติหลังยืนยันส่งมอบเครื่องคืนลูกค้าเรียบร้อยแล้ว',
        });
        if (closed === false) {
          throw new Error('ส่งมอบเครื่องสำเร็จแล้ว แต่ยังปิดใบงานไม่สำเร็จ กรุณาลองปิดใบงานอีกครั้ง');
        }
      } else {
        try {
          await onJobReload?.();
        } catch (refreshError) {
          const message = 'ส่งมอบเครื่องสำเร็จแล้ว แต่รีเฟรชใบงานล่าสุดไม่สำเร็จ';
          setState({ loading: false, saving: false, error: message });
          feedback.actionError(
            refreshError,
            message,
            `repair:handover:${repairJobIdSnapshot}:refresh:error`,
          );
          return;
        }
      }

      setState({ loading: false, saving: false, error: null });
      feedback.actionSuccess(
        'ส่งมอบเครื่องและปิดใบงานเรียบร้อยแล้ว',
        `repair:handover:${repairJobIdSnapshot}:finalize-close:success`,
      );
    } catch (error) {
      const message = handoverFinalized
        ? error?.message || 'ส่งมอบเครื่องสำเร็จแล้ว แต่ปิดใบงานไม่สำเร็จ'
        : error?.message || 'ส่งมอบเครื่องไม่สำเร็จ';
      setState({ loading: false, saving: false, error: message });
      feedback.actionError(
        error,
        message,
        handoverFinalized
          ? `repair:handover:${repairJobIdSnapshot}:close-after-finalize:error`
          : `repair:handover:${repairJobIdSnapshot}:finalize:error`,
      );
    } finally {
      savingRef.current = false;
      setState((current) => ({ ...current, saving: false }));
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Digital Handover</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">ส่งมอบเครื่องคืนลูกค้า</h3>
          <p className="mt-1 text-sm text-slate-500">ยืนยันผู้รับและการส่งมอบครั้งเดียว ระบบจะปิดใบงานให้อัตโนมัติ</p>
        </div>
        <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {workflowStatus}
        </span>
      </div>

      {workflowStatus === 'CLOSED' ? (
        <div className="mt-4 rounded-2xl bg-slate-100 p-4 font-bold text-slate-700">
          ใบงานนี้ส่งมอบและปิดงานเรียบร้อยแล้ว
        </div>
      ) : null}

      {state.loading ? <p className="mt-3 text-sm text-slate-500">กำลังโหลด...</p> : null}

      {!state.loading && handover?.repairAsset ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-black">{handover.repairAsset.displayName || '-'}</p>
          <p className="mt-1 text-xs">รุ่น / Model: {handover.repairAsset.model || '-'}</p>
          <p className="mt-1 text-xs">Serial: {handover.repairAsset.serialNumber || '-'}</p>
        </div>
      ) : null}

      {!state.loading && workflowStatus === 'DELIVERED' ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-800">
          ส่งมอบเสร็จแล้ว — ผู้รับ {handover?.customerConfirmedBy || '-'} กำลังปิดใบงาน
        </div>
      ) : null}

      {!state.loading && workflowStatus === 'READY_FOR_DELIVERY' ? (
        <div className="mt-4 space-y-3">
          <div className={`rounded-2xl p-4 ${handover?.customerConfirmedAt ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>
            {handover?.customerConfirmedAt
              ? `ลูกค้ายืนยันผู้รับแล้ว: ${handover.customerConfirmedBy}`
              : 'ลูกค้าสามารถยืนยันจากลิงก์ติดตาม หรือพนักงานยืนยันผู้รับที่หน้าร้านได้ทันที'}
          </div>

          {!handover?.customerConfirmedAt ? (
            <input
              value={form.receiverName}
              disabled={state.saving}
              onChange={(e) => setForm((v) => ({ ...v, receiverName: e.target.value }))}
              placeholder="ชื่อผู้รับเครื่อง *"
              className="min-h-12 w-full rounded-xl border border-slate-300 px-4 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          ) : null}

          <label className={`flex min-h-14 items-start gap-3 rounded-xl border border-slate-200 px-4 py-3 font-bold ${state.saving ? 'opacity-60' : ''}`}>
            <input
              type="checkbox"
              checked={form.handoverConfirmed}
              disabled={state.saving}
              onChange={(e) => setForm((v) => ({ ...v, handoverConfirmed: e.target.checked }))}
              className="mt-0.5 h-5 w-5"
            />
            <span>
              ยืนยันว่ารับชำระและส่งคืนเครื่อง/อุปกรณ์ครบแล้ว
              <span className="mt-1 block text-xs font-medium text-slate-500">การยืนยันนี้เป็นหลักฐานการส่งมอบแทนการติ๊กหลายรายการ</span>
            </span>
          </label>

          <textarea
            value={form.note}
            disabled={state.saving}
            onChange={(e) => setForm((v) => ({ ...v, note: e.target.value }))}
            rows={2}
            placeholder="หมายเหตุการส่งมอบ (ถ้ามี)"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="button"
            disabled={
              state.saving ||
              !form.handoverConfirmed ||
              (!handover?.customerConfirmedAt && form.receiverName.trim().length < 2)
            }
            onClick={finalizeAndClose}
            className="min-h-12 w-full rounded-xl bg-emerald-700 px-5 font-black text-white disabled:opacity-40"
          >
            {state.saving ? 'กำลังส่งมอบและปิดงาน...' : 'ส่งมอบและปิดงาน'}
          </button>
        </div>
      ) : null}
      {state.error ? <p className="mt-3 text-sm font-bold text-red-600">{state.error}</p> : null}
    </section>
  );
};

export default RepairHandoverPanel;
