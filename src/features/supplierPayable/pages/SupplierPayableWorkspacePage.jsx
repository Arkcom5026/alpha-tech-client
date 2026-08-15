import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, WalletCards } from 'lucide-react';
import { feedback as toast } from '@/design-system';
import {
  createSupplierPayableFromReceipts,
  getSupplierPayableAging,
  getSupplierPayableErrorMessage,
  listSupplierPayableCandidates,
  listSupplierPayables,
} from '../api/supplierPayableApi';
import {
  createSupplierSettlement,
  getSupplierSettlementErrorMessage,
  listSupplierSettlements,
  voidSupplierSettlement,
} from '../api/supplierSettlementApi';
import {
  activateLegacySupplierAdvance,
  applySupplierAdvance,
  createSupplierAdvance,
  getSupplierAdvanceErrorMessage,
  listSupplierAdvances,
  voidSupplierAdvance,
} from '../api/supplierAdvanceApi';
import useSupplierStore from '@/features/supplier/store/supplierStore';
import {
  createSupplierAdjustment,
  getSupplierDisputeErrorMessage,
  listSupplierDisputes,
  openSupplierDispute,
  resolveSupplierDispute,
  voidSupplierAdjustment,
} from '../api/supplierDisputeApi';

const money = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
}).format(Number(value || 0));

const date = (value) => value
  ? new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(new Date(value))
  : '-';

const statusClass = (status) => ({
  OPEN: 'bg-amber-50 text-amber-700',
  PARTIALLY_PAID: 'bg-blue-50 text-blue-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  DISPUTED: 'bg-rose-50 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}[status] || 'bg-slate-100 text-slate-700');

const SupplierPayableWorkspacePage = () => {
  const [payables, setPayables] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [status, setStatus] = useState('');
  const [disputeHistory, setDisputeHistory] = useState({ disputes: [], adjustments: [] });
  const [disputeForm, setDisputeForm] = useState({ payableId: '', disputedAmount: '', reason: '' });
  const [resolutionForm, setResolutionForm] = useState({
    note: '', amount: '', direction: 'CREDIT', type: 'CREDIT_NOTE', documentNumber: '',
  });
  const [adjustmentForm, setAdjustmentForm] = useState({
    payableId: '', amount: '', direction: 'CREDIT', type: 'CREDIT_NOTE',
    documentNumber: '', documentDate: '', note: '',
  });
  const [adjustmentVoidReason, setAdjustmentVoidReason] = useState('');
  const [aging, setAging] = useState(null);
  const [agingSupplierId, setAgingSupplierId] = useState('');
  const [agingAsOf, setAgingAsOf] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settlements, setSettlements] = useState([]);
  const [paymentAllocations, setPaymentAllocations] = useState({});
  const [paymentForm, setPaymentForm] = useState({
    paidAt: new Date().toISOString().slice(0, 10),
    method: 'TRANSFER',
    paymentRef: '',
    note: '',
  });
  const [voidReason, setVoidReason] = useState('');
  const [advances, setAdvances] = useState([]);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState(null);
  const [advanceAllocations, setAdvanceAllocations] = useState({});
  const [reviewAmount, setReviewAmount] = useState('');
  const [advanceVoidReason, setAdvanceVoidReason] = useState('');
  const [advanceForm, setAdvanceForm] = useState({
    supplierId: '',
    amount: '',
    paidAt: new Date().toISOString().slice(0, 10),
    method: 'TRANSFER',
    paymentRef: '',
    note: '',
  });
  const suppliers = useSupplierStore((state) => state.suppliers);
  const fetchSuppliersAction = useSupplierStore((state) => state.fetchSuppliersAction);
  const [form, setForm] = useState({
    documentNumber: '',
    documentDate: '',
    dueDate: '',
    note: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payableResult, candidateResult, settlementResult, advanceResult, agingResult, disputeResult] = await Promise.all([
        listSupplierPayables({ status: status || undefined }),
        listSupplierPayableCandidates(),
        listSupplierSettlements(),
        listSupplierAdvances(),
        getSupplierPayableAging({
          supplierId: agingSupplierId || undefined,
          asOf: agingAsOf,
        }),
        listSupplierDisputes(),
      ]);
      setPayables(Array.isArray(payableResult) ? payableResult : []);
      setCandidates(Array.isArray(candidateResult) ? candidateResult : []);
      setSettlements(Array.isArray(settlementResult) ? settlementResult : []);
      setAdvances(Array.isArray(advanceResult) ? advanceResult : []);
      setAging(agingResult || null);
      setDisputeHistory(disputeResult || { disputes: [], adjustments: [] });
    } catch (error) {
      toast.error(getSupplierPayableErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [agingAsOf, agingSupplierId, status]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { Promise.resolve(fetchSuppliersAction()).catch(() => {}); }, [fetchSuppliersAction]);

  const selected = useMemo(
    () => candidates.filter((item) => selectedIds.includes(item.id)),
    [candidates, selectedIds],
  );
  const selectedSupplierId = selected[0]?.supplierId || null;
  const selectedTotal = selected.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const paymentSelection = payables.filter((item) => paymentAllocations[item.id] != null);
  const paymentSupplierId = paymentSelection[0]?.supplierId || null;
  const paymentTotal = paymentSelection.reduce(
    (sum, item) => sum + Number(paymentAllocations[item.id] || 0),
    0,
  );
  const selectedAdvance = advances.find((item) => item.id === selectedAdvanceId) || null;
  const advanceSelection = payables.filter((item) => advanceAllocations[item.id] != null);
  const advanceTotal = advanceSelection.reduce(
    (sum, item) => sum + Number(advanceAllocations[item.id] || 0),
    0,
  );

  const toggle = (candidate) => {
    setSelectedIds((current) => {
      if (current.includes(candidate.id)) return current.filter((id) => id !== candidate.id);
      if (current.length && selectedSupplierId !== candidate.supplierId) {
        toast.info('หนึ่งรายการเจ้าหนี้ต้องเป็น Supplier รายเดียวกัน');
        return current;
      }
      return [...current, candidate.id];
    });
  };

  const createPayable = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await createSupplierPayableFromReceipts({
        supplierId: selectedSupplierId,
        receiptIds: selectedIds,
        ...form,
      });
      toast.success('ตั้งรายการเจ้าหนี้จากใบรับสินค้าแล้ว');
      setSelectedIds([]);
      setForm({ documentNumber: '', documentDate: '', dueDate: '', note: '' });
      await load();
    } catch (error) {
      toast.error(getSupplierPayableErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const togglePayment = (payable) => {
    setPaymentAllocations((current) => {
      if (current[payable.id] != null) {
        const next = { ...current };
        delete next[payable.id];
        return next;
      }
      if (paymentSupplierId && paymentSupplierId !== payable.supplierId) {
        toast.info('การชำระหนึ่งครั้งต้องเป็น Supplier รายเดียวกัน');
        return current;
      }
      return { ...current, [payable.id]: Number(payable.outstandingAmount || 0) };
    });
  };

  const confirmPayment = async () => {
    if (!paymentSelection.length) return;
    setSaving(true);
    try {
      await createSupplierSettlement({
        supplierId: paymentSupplierId,
        ...paymentForm,
        allocations: paymentSelection.map((item) => ({
          payableId: item.id,
          amount: Number(paymentAllocations[item.id] || 0),
        })),
      });
      toast.success('ยืนยันการชำระและจัดสรรยอดเจ้าหนี้แล้ว');
      setPaymentAllocations({});
      setPaymentForm({ ...paymentForm, paymentRef: '', note: '' });
      await load();
    } catch (error) {
      toast.error(getSupplierSettlementErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const voidPayment = async (paymentId) => {
    if (!voidReason.trim()) {
      toast.info('กรุณาระบุเหตุผลในการยกเลิกก่อน');
      return;
    }
    setSaving(true);
    try {
      await voidSupplierSettlement({ paymentId, reason: voidReason });
      toast.success('ยกเลิกรายการชำระและคืนยอดคงค้างแล้ว');
      setVoidReason('');
      await load();
    } catch (error) {
      toast.error(getSupplierSettlementErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const toggleAdvanceAllocation = (payable) => {
    if (!selectedAdvance || selectedAdvance.status !== 'ACTIVE') {
      toast.info('กรุณาเลือก Advance ที่พร้อมใช้งานก่อน');
      return;
    }
    if (selectedAdvance.supplierId !== payable.supplierId) {
      toast.info('Advance และ Payable ต้องเป็น Supplier รายเดียวกัน');
      return;
    }
    setAdvanceAllocations((current) => {
      if (current[payable.id] != null) {
        const next = { ...current };
        delete next[payable.id];
        return next;
      }
      return {
        ...current,
        [payable.id]: Math.min(
          Number(payable.outstandingAmount || 0),
          Number(selectedAdvance.availableAmount || 0),
        ),
      };
    });
  };

  const createAdvance = async () => {
    setSaving(true);
    try {
      await createSupplierAdvance({
        ...advanceForm,
        supplierId: Number(advanceForm.supplierId),
        amount: Number(advanceForm.amount),
      });
      toast.success('บันทึกเงินจ่ายล่วงหน้า Supplier แล้ว');
      setAdvanceForm({ ...advanceForm, amount: '', paymentRef: '', note: '' });
      await load();
    } catch (error) {
      toast.error(getSupplierAdvanceErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const applyAdvance = async () => {
    if (!selectedAdvance || !advanceSelection.length) return;
    setSaving(true);
    try {
      await applySupplierAdvance({
        advanceId: selectedAdvance.id,
        supplierId: selectedAdvance.supplierId,
        allocations: advanceSelection.map((item) => ({
          payableId: item.id,
          amount: Number(advanceAllocations[item.id] || 0),
        })),
      });
      toast.success('นำ Advance ไปตัดยอดเจ้าหนี้แล้ว');
      setAdvanceAllocations({});
      await load();
    } catch (error) {
      toast.error(getSupplierAdvanceErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const activateAdvance = async (advanceId) => {
    setSaving(true);
    try {
      await activateLegacySupplierAdvance({ advanceId, availableAmount: Number(reviewAmount) });
      toast.success('รับรองยอด Advance เดิมแล้ว');
      setReviewAmount('');
      await load();
    } catch (error) {
      toast.error(getSupplierAdvanceErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const voidAdvance = async (advanceId) => {
    if (!advanceVoidReason.trim()) {
      toast.info('กรุณาระบุเหตุผลในการยกเลิก Advance');
      return;
    }
    setSaving(true);
    try {
      await voidSupplierAdvance({ advanceId, reason: advanceVoidReason });
      toast.success('ยกเลิก Advance และย้อนยอดที่จัดสรรแล้ว');
      setAdvanceVoidReason('');
      setAdvanceAllocations({});
      if (selectedAdvanceId === advanceId) setSelectedAdvanceId(null);
      await load();
    } catch (error) {
      toast.error(getSupplierAdvanceErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const openDispute = async () => {
    setSaving(true);
    try {
      await openSupplierDispute({
        payableId: Number(disputeForm.payableId),
        disputedAmount: Number(disputeForm.disputedAmount),
        reason: disputeForm.reason,
      });
      toast.success('เปิดข้อโต้แย้งและระงับการชำระรายการนี้แล้ว');
      setDisputeForm({ payableId: '', disputedAmount: '', reason: '' });
      await load();
    } catch (error) {
      toast.error(getSupplierDisputeErrorMessage(error));
    } finally { setSaving(false); }
  };

  const createAdjustment = async () => {
    setSaving(true);
    try {
      await createSupplierAdjustment({
        ...adjustmentForm,
        payableId: Number(adjustmentForm.payableId),
        amount: Number(adjustmentForm.amount),
      });
      toast.success('บันทึกรายการปรับยอดเจ้าหนี้แล้ว');
      setAdjustmentForm({ ...adjustmentForm, amount: '', documentNumber: '', documentDate: '', note: '' });
      await load();
    } catch (error) {
      toast.error(getSupplierDisputeErrorMessage(error));
    } finally { setSaving(false); }
  };

  const resolveDispute = async (disputeId) => {
    setSaving(true);
    try {
      const amountValue = Number(resolutionForm.amount);
      await resolveSupplierDispute({
        disputeId,
        resolutionNote: resolutionForm.note,
        ...(amountValue > 0 ? {
          adjustment: {
            amount: amountValue,
            direction: resolutionForm.direction,
            type: resolutionForm.type,
            documentNumber: resolutionForm.documentNumber,
          },
        } : {}),
      });
      toast.success('ปิดข้อโต้แย้งและคืนรายการเข้าสู่กระบวนการเจ้าหนี้แล้ว');
      setResolutionForm({ note: '', amount: '', direction: 'CREDIT', type: 'CREDIT_NOTE', documentNumber: '' });
      await load();
    } catch (error) {
      toast.error(getSupplierDisputeErrorMessage(error));
    } finally { setSaving(false); }
  };

  const voidAdjustment = async (adjustmentId) => {
    if (!adjustmentVoidReason.trim()) return toast.info('กรุณาระบุเหตุผลในการย้อน Adjustment');
    setSaving(true);
    try {
      await voidSupplierAdjustment({ adjustmentId, reason: adjustmentVoidReason });
      toast.success('ย้อน Adjustment และคืนยอดเจ้าหนี้แล้ว');
      setAdjustmentVoidReason('');
      await load();
    } catch (error) {
      toast.error(getSupplierDisputeErrorMessage(error));
    } finally { setSaving(false); }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700"><WalletCards size={18} /> Supplier Payables</div>
          <h1 className="mt-1 text-2xl font-black text-slate-900">รายการเจ้าหนี้ Supplier</h1>
          <p className="mt-1 text-sm text-slate-500">ตั้งหนี้จากใบรับสินค้า ก่อนเข้าสู่กระบวนการจัดสรรการชำระเงิน</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold disabled:opacity-50">
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดใหม่
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">รายการเจ้าหนี้</p><p className="text-2xl font-black">{payables.length}</p></div>
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">ยอดคงค้าง</p><p className="text-2xl font-black text-rose-600">{money(payables.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0))}</p></div>
        <div className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">ใบรับที่ยังไม่ตั้งหนี้</p><p className="text-2xl font-black text-amber-600">{candidates.length}</p></div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-black">Supplier Statement & Aging</h2>
            <p className="text-xs text-slate-500">ยอดคงค้างตามอายุหนี้ ณ วันที่เลือก และเครดิต Advance ที่พร้อมใช้</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select value={agingSupplierId} onChange={(event) => setAgingSupplierId(event.target.value)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="">Supplier ทั้งหมด</option>
              {suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input type="date" value={agingAsOf} onChange={(event) => setAgingAsOf(event.target.value)} className="rounded-xl border px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-rose-50 p-3"><p className="text-xs text-rose-600">หนี้คงค้างรวม</p><strong className="text-lg text-rose-700">{money(aging?.totals?.grossOutstanding)}</strong></div>
          <div className="rounded-xl bg-yellow-50 p-3"><p className="text-xs text-yellow-700">อยู่ระหว่างโต้แย้ง</p><strong className="text-lg text-yellow-800">{money(aging?.totals?.disputedOutstanding)}</strong></div>
          <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs text-emerald-700">Advance พร้อมใช้</p><strong className="text-lg text-emerald-800">{money(aging?.totals?.availableAdvance)}</strong></div>
          <div className="rounded-xl bg-slate-100 p-3"><p className="text-xs text-slate-600">Net Exposure</p><strong className="text-lg text-slate-900">{money(aging?.totals?.netExposure)}</strong></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="border-b text-xs text-slate-500">
              <tr>
                <th className="px-2 py-2">Supplier</th>
                <th className="px-2 py-2 text-right">ยังไม่ครบ</th>
                <th className="px-2 py-2 text-right">1–30 วัน</th>
                <th className="px-2 py-2 text-right">31–60 วัน</th>
                <th className="px-2 py-2 text-right">61–90 วัน</th>
                <th className="px-2 py-2 text-right">&gt; 90 วัน</th>
                <th className="px-2 py-2 text-right">ไม่ระบุวัน</th>
                <th className="px-2 py-2 text-right">Advance</th>
                <th className="px-2 py-2 text-right">สุทธิ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(aging?.suppliers || []).map((item) => (
                <tr key={item.supplierId}>
                  <td className="px-2 py-3"><strong>{item.supplierName}</strong><span className="block text-xs text-slate-500">{item.payableCount} รายการ</span></td>
                  <td className="px-2 py-3 text-right">{money(item.buckets?.notDue)}</td>
                  <td className="px-2 py-3 text-right">{money(item.buckets?.overdue1To30)}</td>
                  <td className="px-2 py-3 text-right">{money(item.buckets?.overdue31To60)}</td>
                  <td className="px-2 py-3 text-right">{money(item.buckets?.overdue61To90)}</td>
                  <td className="px-2 py-3 text-right text-rose-600">{money(item.buckets?.overdue90Plus)}</td>
                  <td className="px-2 py-3 text-right">{money(item.buckets?.noDueDate)}</td>
                  <td className="px-2 py-3 text-right text-emerald-700">{money(item.availableAdvance)}</td>
                  <td className="px-2 py-3 text-right font-black">{money(item.netExposure)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !(aging?.suppliers || []).length && <p className="py-6 text-center text-sm text-slate-500">ไม่มีหนี้คงค้างหรือ Advance ตามตัวกรอง</p>}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b p-4">
            <div><h2 className="font-black">รายการเจ้าหนี้ปัจจุบัน</h2><p className="text-xs text-slate-500">Outstanding มาจาก Payable Authority</p></div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border px-3 py-2 text-sm">
              <option value="">ทุกสถานะ</option><option value="OPEN">OPEN</option><option value="PARTIALLY_PAID">PARTIALLY_PAID</option><option value="PAID">PAID</option><option value="DISPUTED">DISPUTED</option>
            </select>
          </div>
          <div className="divide-y">
            {payables.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {['OPEN', 'PARTIALLY_PAID'].includes(item.status) && (
                      <div className="mt-1 flex flex-col gap-1 text-[10px] font-bold text-slate-500">
                        <label className="flex items-center gap-1"><input type="checkbox" checked={paymentAllocations[item.id] != null} onChange={() => togglePayment(item)} /> เงินจ่าย</label>
                        <label className="flex items-center gap-1"><input type="checkbox" checked={advanceAllocations[item.id] != null} onChange={() => toggleAdvanceAllocation(item)} /> Advance</label>
                      </div>
                    )}
                    <div><p className="font-black">{item.code} · {item.supplier?.name}</p><p className="text-xs text-slate-500">ครบกำหนด {date(item.dueDate)} · ใบรับ {item.receipts?.length || 0} ใบ</p></div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass(item.status)}`}>{item.status}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm"><span>ยอดหนี้ {money(item.totalAmount)}</span><strong className="text-rose-600">คงเหลือ {money(item.outstandingAmount)}</strong></div>
                {paymentAllocations[item.id] != null && (
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={item.outstandingAmount}
                    value={paymentAllocations[item.id]}
                    onChange={(event) => setPaymentAllocations({ ...paymentAllocations, [item.id]: event.target.value })}
                    className="mt-3 w-full rounded-xl border px-3 py-2 text-right text-sm font-bold"
                  />
                )}
                {advanceAllocations[item.id] != null && (
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={Math.min(Number(item.outstandingAmount || 0), Number(selectedAdvance?.availableAmount || 0))}
                    value={advanceAllocations[item.id]}
                    onChange={(event) => setAdvanceAllocations({ ...advanceAllocations, [item.id]: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right text-sm font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                )}
              </div>
            ))}
            {!loading && !payables.length && <div className="p-8 text-center text-sm text-slate-500">ยังไม่มีรายการเจ้าหนี้</div>}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div><h2 className="font-black">ตั้งหนี้จากใบรับสินค้า</h2><p className="text-xs text-slate-500">เลือกได้หลายใบ แต่ต้องเป็น Supplier เดียวกัน</p></div>
          <div className="max-h-80 space-y-2 overflow-auto">
            {candidates.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-emerald-50">
                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggle(item)} className="mt-1" />
                <span className="min-w-0 flex-1"><span className="block font-bold">{item.code} · {item.supplierName}</span><span className="block text-xs text-slate-500">{item.source} · {item.deliveryNoteNumber || 'ไม่มีเลขใบส่งสินค้า'}</span></span>
                <strong className="text-sm">{money(item.totalAmount)}</strong>
              </label>
            ))}
            {!loading && !candidates.length && <p className="py-6 text-center text-sm text-slate-500">ไม่มีใบรับที่รอตั้งหนี้</p>}
          </div>
          {selected.some((item) => Number(item.legacyPaidAmount || 0) > 0) && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800"><AlertTriangle size={16} /> ระบบจะยกยอดที่เคยชำระจาก Legacy Payment มาคำนวณยอดคงเหลือ</div>}
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.documentNumber} onChange={(event) => setForm({ ...form, documentNumber: event.target.value })} placeholder="เลขเอกสารเรียกเก็บ (ถ้ามี)" className="rounded-xl border px-3 py-2 text-sm" />
            <input type="date" value={form.documentDate} onChange={(event) => setForm({ ...form, documentDate: event.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
            <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
            <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="หมายเหตุ" className="rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center justify-between"><strong>รวม {money(selectedTotal)}</strong><button type="button" onClick={createPayable} disabled={!selected.length || saving} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'ตั้งรายการเจ้าหนี้'}</button></div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-rose-200 bg-white p-4">
        <div><h2 className="font-black">ข้อโต้แย้งและการปรับยอด Supplier</h2><p className="text-xs text-slate-500">รายการที่อยู่ระหว่างโต้แย้งจะไม่สามารถชำระหรือใช้ Advance จนกว่าจะปิดข้อโต้แย้ง</p></div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3 rounded-xl bg-rose-50 p-3">
            <h3 className="text-sm font-black text-rose-700">เปิดข้อโต้แย้ง</h3>
            <select value={disputeForm.payableId} onChange={(event) => setDisputeForm({ ...disputeForm, payableId: event.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
              <option value="">เลือก Payable</option>
              {payables.filter((item) => ['OPEN', 'PARTIALLY_PAID'].includes(item.status)).map((item) => <option key={item.id} value={item.id}>{item.code} · {item.supplier?.name} · {money(item.outstandingAmount)}</option>)}
            </select>
            <input type="number" min="0.01" step="0.01" value={disputeForm.disputedAmount} onChange={(event) => setDisputeForm({ ...disputeForm, disputedAmount: event.target.value })} placeholder="ยอดที่โต้แย้ง" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <input value={disputeForm.reason} onChange={(event) => setDisputeForm({ ...disputeForm, reason: event.target.value })} placeholder="เหตุผล เช่น สินค้าขาด ราคาไม่ตรง หรือเสียหาย" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <button type="button" onClick={openDispute} disabled={!disputeForm.payableId || Number(disputeForm.disputedAmount) <= 0 || !disputeForm.reason.trim() || saving} className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">เปิดข้อโต้แย้ง</button>
          </div>
          <div className="space-y-3 rounded-xl bg-blue-50 p-3">
            <h3 className="text-sm font-black text-blue-700">Credit / Debit Adjustment โดยตรง</h3>
            <select value={adjustmentForm.payableId} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, payableId: event.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
              <option value="">เลือก Payable</option>
              {payables.filter((item) => item.status !== 'CANCELLED').map((item) => <option key={item.id} value={item.id}>{item.code} · {item.supplier?.name}</option>)}
            </select>
            <div className="grid gap-2 sm:grid-cols-3">
              <select value={adjustmentForm.direction} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, direction: event.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="CREDIT">ลดหนี้ (Credit)</option><option value="DEBIT">เพิ่มหนี้ (Debit)</option></select>
              <select value={adjustmentForm.type} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, type: event.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="CREDIT_NOTE">Credit Note</option><option value="DEBIT_NOTE">Debit Note</option><option value="PRICE_CORRECTION">แก้ราคา</option><option value="SHORTAGE">สินค้าขาด</option><option value="DAMAGE">สินค้าเสียหาย</option><option value="DISCOUNT">ส่วนลด</option><option value="OTHER">อื่น ๆ</option></select>
              <input type="number" min="0.01" step="0.01" value={adjustmentForm.amount} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, amount: event.target.value })} placeholder="จำนวนเงิน" className="rounded-xl border px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2"><input value={adjustmentForm.documentNumber} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, documentNumber: event.target.value })} placeholder="เลขที่เอกสาร" className="rounded-xl border px-3 py-2 text-sm" /><input type="date" value={adjustmentForm.documentDate} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, documentDate: event.target.value })} className="rounded-xl border px-3 py-2 text-sm" /></div>
            <input value={adjustmentForm.note} onChange={(event) => setAdjustmentForm({ ...adjustmentForm, note: event.target.value })} placeholder="หมายเหตุ" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <button type="button" onClick={createAdjustment} disabled={!adjustmentForm.payableId || Number(adjustmentForm.amount) <= 0 || saving} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">ยืนยันการปรับยอด</button>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-black">ข้อโต้แย้งที่เปิดอยู่</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={resolutionForm.note} onChange={(event) => setResolutionForm({ ...resolutionForm, note: event.target.value })} placeholder="ผลการเจรจา/เหตุผลปิดข้อโต้แย้ง" className="rounded-xl border px-3 py-2 text-sm sm:col-span-2" />
              <select value={resolutionForm.direction} onChange={(event) => setResolutionForm({ ...resolutionForm, direction: event.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="CREDIT">ลดหนี้</option><option value="DEBIT">เพิ่มหนี้</option></select>
              <select value={resolutionForm.type} onChange={(event) => setResolutionForm({ ...resolutionForm, type: event.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="CREDIT_NOTE">Credit Note</option><option value="DEBIT_NOTE">Debit Note</option><option value="PRICE_CORRECTION">แก้ราคา</option><option value="SHORTAGE">สินค้าขาด</option><option value="DAMAGE">สินค้าเสียหาย</option><option value="DISCOUNT">ส่วนลด</option><option value="OTHER">อื่น ๆ</option></select>
              <input type="number" min="0.01" step="0.01" value={resolutionForm.amount} onChange={(event) => setResolutionForm({ ...resolutionForm, amount: event.target.value })} placeholder="ยอดปรับ (เว้นว่างได้)" className="rounded-xl border px-3 py-2 text-sm" />
              <input value={resolutionForm.documentNumber} onChange={(event) => setResolutionForm({ ...resolutionForm, documentNumber: event.target.value })} placeholder="เลข Credit/Debit Note" className="rounded-xl border px-3 py-2 text-sm" />
            </div>
            {(disputeHistory.disputes || []).filter((item) => item.status === 'OPEN').map((item) => <div key={item.id} className="rounded-xl border p-3"><div className="flex justify-between gap-3"><div><strong>{item.payableCode} · {item.supplierName}</strong><p className="text-xs text-slate-500">{item.reason}</p></div><strong className="text-rose-600">{money(item.disputedAmount)}</strong></div><button type="button" onClick={() => resolveDispute(item.id)} disabled={!resolutionForm.note.trim() || saving} className="mt-2 text-xs font-black text-blue-600 disabled:opacity-50">ปิดข้อโต้แย้ง{Number(resolutionForm.amount) > 0 ? 'พร้อมปรับยอด' : ''}</button></div>)}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-black">ประวัติ Adjustment</h3>
            <input value={adjustmentVoidReason} onChange={(event) => setAdjustmentVoidReason(event.target.value)} placeholder="เหตุผลย้อนรายการ (OWNER)" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <div className="max-h-72 divide-y overflow-auto">{(disputeHistory.adjustments || []).map((item) => <div key={item.id} className="py-3"><div className="flex justify-between gap-3"><div><strong>{item.code} · {item.payableCode}</strong><p className="text-xs text-slate-500">{item.type} · {item.direction} · {item.documentNumber || 'ไม่มีเลขเอกสาร'}</p></div><strong className={item.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}>{item.direction === 'CREDIT' ? '-' : '+'}{money(item.amount)}</strong></div><div className="mt-2 flex justify-between"><span className="text-[10px] font-black">{item.status}</span>{item.status === 'CONFIRMED' && <button type="button" onClick={() => voidAdjustment(item.id)} disabled={saving} className="text-xs font-black text-rose-600 disabled:opacity-50">ย้อนรายการ</button>}</div></div>)}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div><h2 className="font-black">ยืนยันการชำระ Supplier</h2><p className="text-xs text-slate-500">เลือก Payable ด้านบนได้หลายรายการจาก Supplier เดียวกัน</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" value={paymentForm.paidAt} onChange={(event) => setPaymentForm({ ...paymentForm, paidAt: event.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
            <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })} className="rounded-xl border px-3 py-2 text-sm">
              <option value="TRANSFER">โอนเงิน</option><option value="CASH">เงินสด</option><option value="QR">QR</option><option value="CHEQUE">เช็ค</option><option value="OTHER">อื่น ๆ</option>
            </select>
            <input value={paymentForm.paymentRef} onChange={(event) => setPaymentForm({ ...paymentForm, paymentRef: event.target.value })} placeholder="เลขอ้างอิงการชำระ" className="rounded-xl border px-3 py-2 text-sm" />
            <input value={paymentForm.note} onChange={(event) => setPaymentForm({ ...paymentForm, note: event.target.value })} placeholder="หมายเหตุ" className="rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center justify-between"><strong>ยอดชำระ {money(paymentTotal)}</strong><button type="button" onClick={confirmPayment} disabled={!paymentSelection.length || paymentTotal <= 0 || saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">ยืนยันการชำระ</button></div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div><h2 className="font-black">ประวัติการชำระ</h2><p className="text-xs text-slate-500">รายการยืนยันแล้วจะยกเลิกด้วย Reversal เท่านั้น</p></div>
          <input value={voidReason} onChange={(event) => setVoidReason(event.target.value)} placeholder="เหตุผลสำหรับการยกเลิก (สิทธิ์ OWNER)" className="w-full rounded-xl border px-3 py-2 text-sm" />
          <div className="max-h-80 divide-y overflow-auto">
            {settlements.map((item) => (
              <div key={item.id} className="py-3">
                <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{item.code} · {item.supplier?.name}</p><p className="text-xs text-slate-500">{date(item.paidAt)} · {item.method} · จัดสรร {item.allocations?.length || 0} รายการ</p></div><strong>{money(item.amount)}</strong></div>
                <div className="mt-2 flex items-center justify-between"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${item.lifecycleStatus === 'VOIDED' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>{item.lifecycleStatus}</span>{item.lifecycleStatus === 'CONFIRMED' && <button type="button" onClick={() => voidPayment(item.id)} disabled={saving} className="text-xs font-black text-rose-600 disabled:opacity-50">ยกเลิกรายการ</button>}</div>
              </div>
            ))}
            {!loading && !settlements.length && <p className="py-6 text-center text-sm text-slate-500">ยังไม่มีประวัติการชำระผ่าน Payable</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-4">
          <div><h2 className="font-black">บันทึกเงินจ่ายล่วงหน้า</h2><p className="text-xs text-slate-500">สร้างเครดิตที่นำไปตัด Payable ภายหลังได้</p></div>
          <select value={advanceForm.supplierId} onChange={(event) => setAdvanceForm({ ...advanceForm, supplierId: event.target.value })} className="w-full rounded-xl border px-3 py-2 text-sm">
            <option value="">เลือก Supplier</option>
            {suppliers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="number" min="0.01" step="0.01" value={advanceForm.amount} onChange={(event) => setAdvanceForm({ ...advanceForm, amount: event.target.value })} placeholder="จำนวนเงิน" className="rounded-xl border px-3 py-2 text-sm" />
            <input type="date" value={advanceForm.paidAt} onChange={(event) => setAdvanceForm({ ...advanceForm, paidAt: event.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
            <select value={advanceForm.method} onChange={(event) => setAdvanceForm({ ...advanceForm, method: event.target.value })} className="rounded-xl border px-3 py-2 text-sm"><option value="TRANSFER">โอนเงิน</option><option value="CASH">เงินสด</option><option value="QR">QR</option><option value="CHEQUE">เช็ค</option><option value="OTHER">อื่น ๆ</option></select>
            <input value={advanceForm.paymentRef} onChange={(event) => setAdvanceForm({ ...advanceForm, paymentRef: event.target.value })} placeholder="เลขอ้างอิง" className="rounded-xl border px-3 py-2 text-sm" />
          </div>
          <input value={advanceForm.note} onChange={(event) => setAdvanceForm({ ...advanceForm, note: event.target.value })} placeholder="หมายเหตุ" className="w-full rounded-xl border px-3 py-2 text-sm" />
          <button type="button" onClick={createAdvance} disabled={!advanceForm.supplierId || Number(advanceForm.amount) <= 0 || saving} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">ยืนยันเงินจ่ายล่วงหน้า</button>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div><h2 className="font-black">Advance Credit</h2><p className="text-xs text-slate-500">เลือกรายการ ACTIVE แล้วเลือก Payable ด้านบนเพื่อจัดสรร</p></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={reviewAmount} onChange={(event) => setReviewAmount(event.target.value)} type="number" min="0.01" step="0.01" placeholder="ยอดคงเหลือที่ OWNER รับรอง" className="rounded-xl border px-3 py-2 text-sm" />
            <input value={advanceVoidReason} onChange={(event) => setAdvanceVoidReason(event.target.value)} placeholder="เหตุผลยกเลิก Advance" className="rounded-xl border px-3 py-2 text-sm" />
          </div>
          <div className="max-h-96 divide-y overflow-auto">
            {advances.map((item) => (
              <div key={item.id} className={`py-3 ${selectedAdvanceId === item.id ? 'bg-emerald-50' : ''}`}>
                <div className="flex items-start gap-3">
                  {item.status === 'ACTIVE' && <input type="radio" name="selectedAdvance" className="mt-1" checked={selectedAdvanceId === item.id} onChange={() => { setSelectedAdvanceId(item.id); setAdvanceAllocations({}); }} />}
                  <div className="min-w-0 flex-1"><p className="font-bold">{item.code} · {item.supplier?.name}</p><p className="text-xs text-slate-500">ตั้งต้น {money(item.originalAmount)} · ใช้แล้ว {money(item.usedAmount)}</p></div>
                  <div className="text-right"><strong className="block text-emerald-700">{money(item.availableAmount)}</strong><span className="text-[10px] font-black">{item.status}</span></div>
                </div>
                <div className="mt-2 flex justify-end gap-3">
                  {item.status === 'REVIEW_REQUIRED' && <button type="button" onClick={() => activateAdvance(item.id)} disabled={Number(reviewAmount) <= 0 || saving} className="text-xs font-black text-blue-600 disabled:opacity-50">รับรองยอดเดิม</button>}
                  {item.status !== 'VOIDED' && <button type="button" onClick={() => voidAdvance(item.id)} disabled={saving} className="text-xs font-black text-rose-600 disabled:opacity-50">ยกเลิก</button>}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-3"><span className="text-sm">ใช้ Advance {money(advanceTotal)} / คงเหลือ {money(selectedAdvance?.availableAmount)}</span><button type="button" onClick={applyAdvance} disabled={!selectedAdvance || !advanceSelection.length || advanceTotal <= 0 || advanceTotal > Number(selectedAdvance.availableAmount || 0) || saving} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50">ตัดยอดด้วย Advance</button></div>
        </div>
      </div>
    </section>
  );
};

export default SupplierPayableWorkspacePage;
