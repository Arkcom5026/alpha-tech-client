import React, { useCallback, useEffect, useMemo, useState } from 'react';
import repairApi from '../api/repairApi';
import { listExpensePayees } from '@/features/taxExpense/api/taxExpenseApi';
import ExpensePayeeQuickCreateDialog from './ExpensePayeeQuickCreateDialog';

const money = (value) =>
  value === null || value === undefined || value === ''
    ? '-'
    : new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2,
      }).format(Number(value || 0));

const dateText = (value) => (value ? new Date(value).toLocaleString('th-TH') : '-');
const toIsoOrNull = (value) => (value ? new Date(value).toISOString() : null);

const emptySendForm = (job) => ({
  expensePayeeId: '',
  providerName: '',
  providerPhone: '',
  workScope: '',
  externalReference: '',
  trackingNumber: '',
  customerEstimateAmount: Number(job?.estimatedCost || 0) > 0 ? String(job.estimatedCost) : '',
  customerApprovalNote: '',
  expectedReturnAt: '',
});

const RepairSubcontractPanel = ({ job, onChanged, refreshKey = 0 }) => {
  const [context, setContext] = useState(null);
  const [payees, setPayees] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sendForm, setSendForm] = useState(() => emptySendForm(job));
  const [updateForm, setUpdateForm] = useState({
    providerQuotedAmount: '',
    providerQuoteNote: '',
    customerDecisionNote: '',
    externalReference: '',
    trackingNumber: '',
    expectedReturnAt: '',
  });
  const [returnNote, setReturnNote] = useState('');
  const [receiveForm, setReceiveForm] = useState({ actualExternalCost: '', transportCost: '', materialCost: '', otherOperationalCost: '', resultNote: '' });

  const activeFromJob = job?.workflow?.subcontractContext || null;
  const workflowStatus = job?.workflow?.status || context?.workflowStatus || 'RECEIVED';
  const canOpen = ['APPROVED', 'REPAIRING'].includes(workflowStatus);
  const shouldLoadContext = Boolean(activeFromJob || expanded);

  const load = useCallback(async () => {
    if (!job?.id || !shouldLoadContext) return;
    setLoading(true);
    setError('');
    try {
      const data = await repairApi.getSubcontractContext(job.id);
      setContext(data);
      const paidTotal = (data?.relatedExpenses || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
      if (paidTotal > 0) {
        setReceiveForm((current) => current.actualExternalCost ? current : { ...current, actualExternalCost: String(paidTotal) });
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [job?.id, shouldLoadContext]);

  useEffect(() => {
    if (!shouldLoadContext) return;
    load();
  }, [load, refreshKey, shouldLoadContext]);

  useEffect(() => {
    if (!expanded || activeFromJob) return;
    listExpensePayees()
      .then((rows) => setPayees(Array.isArray(rows) ? rows : []))
      .catch(() => setPayees([]));
  }, [expanded, activeFromJob, refreshKey]);

  useEffect(() => {
    setSendForm(emptySendForm(job));
  }, [job?.id, job?.estimatedCost]);

  const active = context?.active || activeFromJob || null;
  const outsourceConsent = Boolean(context?.outsourceConsent);

  const handlePayeeCreated = async (created) => {
    if (!created?.id) return;
    setPayees((current) => [created, ...current.filter((item) => Number(item.id) !== Number(created.id))]);
    setSendForm((current) => ({
      ...current,
      expensePayeeId: String(created.id),
      providerPhone: current.providerPhone || created.phone || '',
    }));
    setNotice(`เพิ่มผู้รับซ่อม “${created.name}” และเลือกให้ใบงานนี้แล้ว`);
  };

  const runMutation = async (work, successMessage) => {
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await work();
      setNotice(successMessage);
      await load();
      await onChanged?.();
      return true;
    } catch (mutationError) {
      setError(mutationError.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!sendForm.expensePayeeId || !sendForm.workScope.trim()) return;
    const ok = await runMutation(
      () => repairApi.sendSubcontract(job.id, {
        ...sendForm,
        expensePayeeId: Number(sendForm.expensePayeeId),
        customerEstimateAmount: sendForm.customerEstimateAmount === ''
          ? null
          : Number(sendForm.customerEstimateAmount),
        expectedReturnAt: toIsoOrNull(sendForm.expectedReturnAt),
      }),
      'บันทึกการส่งซ่อมภายนอกแล้ว ใบงานภายในร้านถูกพักจนกว่าจะรับเครื่องกลับ'
    );
    if (ok) setExpanded(false);
  };

  const update = async () => {
    if (!active?.subcontractId && !active?.id) return;
    await runMutation(
      () => repairApi.updateSubcontract(job.id, active.subcontractId || active.id, {
        ...updateForm,
        providerQuotedAmount: updateForm.providerQuotedAmount === ''
          ? null
          : Number(updateForm.providerQuotedAmount),
        expectedReturnAt: toIsoOrNull(updateForm.expectedReturnAt),
      }),
      'อัปเดตข้อมูลจากผู้รับซ่อมภายนอกแล้ว'
    );
  };

  const requestReturn = async () => {
    if (!active?.subcontractId && !active?.id) return;
    await runMutation(
      () => repairApi.commandSubcontract(job.id, active.subcontractId || active.id, {
        action: 'REQUEST_RETURN',
        note: returnNote.trim() || null,
      }),
      'บันทึกการขอรับเครื่องกลับแล้ว'
    );
  };

  const receiveReturn = async () => {
    if ((!active?.subcontractId && !active?.id) || !receiveForm.resultNote.trim()) return;
    const ok = await runMutation(
      () => repairApi.commandSubcontract(job.id, active.subcontractId || active.id, {
        action: 'RECEIVE_RETURN',
        resultNote: receiveForm.resultNote.trim(),
        actualExternalCost: receiveForm.actualExternalCost === ''
          ? null
          : Number(receiveForm.actualExternalCost),
        transportCost: receiveForm.transportCost === '' ? null : Number(receiveForm.transportCost),
        materialCost: receiveForm.materialCost === '' ? null : Number(receiveForm.materialCost),
        otherOperationalCost: receiveForm.otherOperationalCost === '' ? null : Number(receiveForm.otherOperationalCost),
      }),
      'รับเครื่องกลับเข้าร้านแล้ว ระบบปลดการพักใบงานและสามารถดำเนิน Repair Workflow ต่อได้'
    );
    if (ok) {
      setReturnNote('');
      setReceiveForm({ actualExternalCost: '', transportCost: '', materialCost: '', otherOperationalCost: '', resultNote: '' });
    }
  };

  const history = useMemo(() => context?.items || [], [context?.items]);
  const relatedExpenseTotal = useMemo(() => (context?.relatedExpenses || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0), [context?.relatedExpenses]);

  if (!job?.id) return null;

  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">External Repair · Optional</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">ส่งซ่อมซับนอก</h3>
          <p className="mt-1 text-sm text-slate-600">
            ใช้เมื่อร้านประเมินงานและคุยเงื่อนไขกับลูกค้าแล้ว แต่ต้องส่งอุปกรณ์ให้ผู้รับซ่อมภายนอกดำเนินการต่อ
          </p>
        </div>
        {!active && canOpen ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-fit rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-black text-violet-800"
          >
            {expanded ? 'ซ่อนแบบฟอร์ม' : 'เปิดขั้นตอนส่งซับนอก'}
          </button>
        ) : null}
      </div>

      {loading && !context ? <p className="mt-3 text-sm text-slate-500">กำลังโหลดข้อมูล...</p> : null}
      {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      {notice ? <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{notice}</p> : null}

      {active ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-black text-violet-700">ใบงานภายในร้านถูกพัก</p>
                <p className="mt-1 text-lg font-black text-violet-950">{active.providerName}</p>
                <p className="mt-1 text-sm text-violet-800">{active.workScope}</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-violet-800">
                {active.status === 'RETURN_REQUESTED' ? 'กำลังรอรับเครื่องกลับ' : 'อยู่ระหว่างส่งซ่อมภายนอก'}
              </span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="ส่งออกเมื่อ" value={dateText(active.sentAt)} />
              <Metric label="ราคาที่แจ้งลูกค้าโดยประมาณ" value={money(active.customerEstimateAmount)} />
              <Metric label="ราคาที่ซับนอกแจ้งล่าสุด" value={money(active.providerQuotedAmount)} />
            </div>
            {active.customerApprovalNote ? <Note label="ข้อตกลง/หมายเหตุที่คุยกับลูกค้า" value={active.customerApprovalNote} /> : null}
            {active.providerQuoteNote ? <Note label="รายละเอียดราคาจากซับนอก" value={active.providerQuoteNote} /> : null}
            {active.customerDecisionNote ? <Note label="การตัดสินใจ/หมายเหตุเพิ่มเติม" value={active.customerDecisionNote} /> : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-black text-slate-950">อัปเดตราคาและข้อมูลจากซับนอก</h4>
            <p className="mt-1 text-xs text-slate-500">ระบบเก็บข้อมูลไว้เป็นหลักฐาน แต่ไม่บังคับว่าราคาต้องเป็นเพดานหรือตายตัว</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input type="number" min="0" value={updateForm.providerQuotedAmount} onChange={(e) => setUpdateForm((v) => ({ ...v, providerQuotedAmount: e.target.value }))} placeholder="ราคาที่ซับนอกเสนอ" className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
              <input value={updateForm.externalReference} onChange={(e) => setUpdateForm((v) => ({ ...v, externalReference: e.target.value }))} placeholder="เลขอ้างอิงจากผู้รับซ่อม" className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
              <input value={updateForm.trackingNumber} onChange={(e) => setUpdateForm((v) => ({ ...v, trackingNumber: e.target.value }))} placeholder="เลขติดตามขนส่ง" className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
              <input type="datetime-local" value={updateForm.expectedReturnAt} onChange={(e) => setUpdateForm((v) => ({ ...v, expectedReturnAt: e.target.value }))} className="rounded-xl border border-slate-300 bg-white px-4 py-3" />
              <textarea rows={2} value={updateForm.providerQuoteNote} onChange={(e) => setUpdateForm((v) => ({ ...v, providerQuoteNote: e.target.value }))} placeholder="รายละเอียดราคาหรือเงื่อนไขจากซับนอก" className="rounded-xl border border-slate-300 bg-white px-4 py-3 md:col-span-2" />
              <textarea rows={2} value={updateForm.customerDecisionNote} onChange={(e) => setUpdateForm((v) => ({ ...v, customerDecisionNote: e.target.value }))} placeholder="เช่น ลูกค้าตกลงให้ทำต่อ / ขอคิดก่อน / ไม่ซ่อม ขอเครื่องกลับ" className="rounded-xl border border-slate-300 bg-white px-4 py-3 md:col-span-2" />
            </div>
            <button type="button" disabled={loading} onClick={update} className="mt-3 rounded-xl bg-slate-900 px-5 py-3 font-black text-white disabled:opacity-40">บันทึกข้อมูลล่าสุด</button>
          </div>

          {active.status === 'SENT' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h4 className="font-black text-amber-950">ไม่ดำเนินการต่อ / ต้องการเครื่องกลับ?</h4>
              <textarea rows={2} value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="เหตุผลหรือหมายเหตุ เช่น ราคาเกินที่คุยไว้ ลูกค้าไม่อนุมัติ" className="mt-3 w-full rounded-xl border border-amber-200 bg-white px-4 py-3" />
              <button type="button" disabled={loading} onClick={requestReturn} className="mt-3 rounded-xl bg-amber-600 px-5 py-3 font-black text-white disabled:opacity-40">ขอรับเครื่องกลับ</button>
            </div>
          ) : null}

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <h4 className="font-black text-emerald-950">รับเครื่องกลับเข้าร้าน</h4>
            <p className="mt-1 text-sm text-emerald-800">ยืนยันเฉพาะเมื่ออุปกรณ์กลับถึงร้านจริง ระบบจึงจะปลด Hold ของ Repair Workflow</p>
            <div className="mt-3 rounded-xl bg-white p-3 text-sm text-emerald-900">
              <p className="font-black">ยอด Expense ที่บัญชีบันทึกสำหรับงานนี้: {money(relatedExpenseTotal)}</p>
              <p className="mt-1 text-xs">ใช้เป็นข้อมูลตั้งต้นสำหรับต้นทุนงานซ่อมเท่านั้น การยืนยันหรือเพิ่มต้นทุนเสริมจะไม่สร้างรายการบัญชีหรือภาษี</p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input type="number" min="0" value={receiveForm.actualExternalCost} onChange={(e) => setReceiveForm((v) => ({ ...v, actualExternalCost: e.target.value }))} placeholder="ต้นทุนซับนอกจริง (ถ้าทราบ)" className="rounded-xl border border-emerald-200 bg-white px-4 py-3" />
              <input type="number" min="0" value={receiveForm.transportCost} onChange={(e) => setReceiveForm((v) => ({ ...v, transportCost: e.target.value }))} placeholder="ค่าขนส่ง (ต้นทุนงาน)" className="rounded-xl border border-emerald-200 bg-white px-4 py-3" />
              <input type="number" min="0" value={receiveForm.materialCost} onChange={(e) => setReceiveForm((v) => ({ ...v, materialCost: e.target.value }))} placeholder="ค่าวัสดุ/อุปกรณ์เสริม" className="rounded-xl border border-emerald-200 bg-white px-4 py-3" />
              <input type="number" min="0" value={receiveForm.otherOperationalCost} onChange={(e) => setReceiveForm((v) => ({ ...v, otherOperationalCost: e.target.value }))} placeholder="ต้นทุนเชิงงานอื่น" className="rounded-xl border border-emerald-200 bg-white px-4 py-3" />
              <textarea rows={3} value={receiveForm.resultNote} onChange={(e) => setReceiveForm((v) => ({ ...v, resultNote: e.target.value }))} placeholder="ผลเมื่อรับเครื่องกลับ * เช่น ซ่อมแล้ว / ไม่ได้ซ่อม / ส่งกลับสภาพเดิม" className="rounded-xl border border-emerald-200 bg-white px-4 py-3 md:col-span-2" />
            </div>
            <button type="button" disabled={loading || !receiveForm.resultNote.trim()} onClick={receiveReturn} className="mt-3 rounded-xl bg-emerald-700 px-5 py-3 font-black text-white disabled:opacity-40">ยืนยันรับเครื่องกลับ</button>
          </div>
        </div>
      ) : expanded ? (
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
          {!outsourceConsent ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">
              ลูกค้ายังไม่ได้อนุญาตให้ส่งซ่อมภายนอก กรุณาแก้ไขหลักฐานการรับเครื่องและให้ลูกค้ายืนยันสิทธิ์นี้ก่อน
            </p>
          ) : null}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="flex gap-2">
              <select value={sendForm.expensePayeeId} onChange={(e) => setSendForm((v) => ({ ...v, expensePayeeId: e.target.value }))} className="min-w-0 flex-1 rounded-xl border border-violet-200 bg-white px-4 py-3">
                <option value="">เลือก ExpensePayee ผู้รับซ่อม *</option>
                {payees.map((payee) => <option key={payee.id} value={payee.id}>{payee.name}{payee.taxId ? ` · ${payee.taxId}` : ''}</option>)}
              </select>
              <button type="button" onClick={() => setQuickCreateOpen(true)} className="shrink-0 rounded-xl border border-violet-300 bg-white px-4 py-3 text-sm font-black text-violet-800 hover:bg-violet-100">+ เพิ่มผู้รับซ่อม</button>
            </div>
            <input value={sendForm.providerPhone} onChange={(e) => setSendForm((v) => ({ ...v, providerPhone: e.target.value }))} placeholder="เบอร์ติดต่อ" className="rounded-xl border border-violet-200 bg-white px-4 py-3" />
            <textarea rows={3} value={sendForm.workScope} onChange={(e) => setSendForm((v) => ({ ...v, workScope: e.target.value }))} placeholder="ขอบเขตงานที่ส่งซ่อม *" className="rounded-xl border border-violet-200 bg-white px-4 py-3 md:col-span-2" />
            <input type="number" min="0" value={sendForm.customerEstimateAmount} onChange={(e) => setSendForm((v) => ({ ...v, customerEstimateAmount: e.target.value }))} placeholder="ราคาที่แจ้งลูกค้าโดยประมาณ" className="rounded-xl border border-violet-200 bg-white px-4 py-3" />
            <input type="datetime-local" value={sendForm.expectedReturnAt} onChange={(e) => setSendForm((v) => ({ ...v, expectedReturnAt: e.target.value }))} className="rounded-xl border border-violet-200 bg-white px-4 py-3" />
            <textarea rows={2} value={sendForm.customerApprovalNote} onChange={(e) => setSendForm((v) => ({ ...v, customerApprovalNote: e.target.value }))} placeholder="ข้อตกลง/หมายเหตุที่คุยกับลูกค้า เช่น ประมาณไม่เกิน 3,000 ถ้าเกินโทรถามก่อน" className="rounded-xl border border-violet-200 bg-white px-4 py-3 md:col-span-2" />
            <input value={sendForm.externalReference} onChange={(e) => setSendForm((v) => ({ ...v, externalReference: e.target.value }))} placeholder="เลขอ้างอิงจากผู้รับซ่อม" className="rounded-xl border border-violet-200 bg-white px-4 py-3" />
            <input value={sendForm.trackingNumber} onChange={(e) => setSendForm((v) => ({ ...v, trackingNumber: e.target.value }))} placeholder="เลขติดตามขนส่ง" className="rounded-xl border border-violet-200 bg-white px-4 py-3" />
          </div>
          {!payees.length ? <p className="mt-3 text-sm font-bold text-amber-700">ยังไม่มี ExpensePayee ผู้รับซ่อม กด “+ เพิ่มผู้รับซ่อม” เพื่อสร้างได้โดยไม่ออกจากใบงาน</p> : null}
          <button type="button" disabled={loading || !outsourceConsent || !sendForm.expensePayeeId || !sendForm.workScope.trim()} onClick={send} className="mt-4 rounded-xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-40">ยืนยันส่งซ่อมภายนอกและพักงานในร้าน</button>
        </div>
      ) : !canOpen ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">ขั้นตอนส่งซับนอกจะเปิดหลังลูกค้าตัดสินใจแนวทางซ่อมแล้ว หรือเมื่องานอยู่ในขั้นกำลังซ่อม</p>
      ) : null}

      {history.length ? (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-black text-slate-700">ประวัติส่งซ่อมภายนอก ({history.length})</summary>
          <div className="mt-3 space-y-2">
            {history.map((item) => (
              <div key={item.id} className="rounded-lg bg-white p-3 text-sm">
                <p className="font-black text-slate-900">{item.providerName} · {item.status}</p>
                <p className="mt-1 text-xs text-slate-500">{dateText(item.sentAt)} · {item.workScope}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <ExpensePayeeQuickCreateDialog
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={handlePayeeCreated}
      />
    </section>
  );
};

const Metric = ({ label, value }) => (
  <div className="rounded-lg bg-white p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-900">{value}</p>
  </div>
);

const Note = ({ label, value }) => (
  <div className="mt-3 rounded-lg bg-white p-3">
    <p className="text-xs font-black text-slate-500">{label}</p>
    <p className="mt-1 whitespace-pre-wrap text-sm font-bold text-slate-800">{value}</p>
  </div>
);

export default RepairSubcontractPanel;
