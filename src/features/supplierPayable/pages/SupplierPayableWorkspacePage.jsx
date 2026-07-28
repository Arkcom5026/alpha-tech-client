import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw, WalletCards } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  createSupplierPayableFromReceipts,
  getSupplierPayableErrorMessage,
  listSupplierPayableCandidates,
  listSupplierPayables,
} from '../api/supplierPayableApi';

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    documentNumber: '',
    documentDate: '',
    dueDate: '',
    note: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [payableResult, candidateResult] = await Promise.all([
        listSupplierPayables({ status: status || undefined }),
        listSupplierPayableCandidates(),
      ]);
      setPayables(Array.isArray(payableResult) ? payableResult : []);
      setCandidates(Array.isArray(candidateResult) ? candidateResult : []);
    } catch (error) {
      toast.error(getSupplierPayableErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const selected = useMemo(
    () => candidates.filter((item) => selectedIds.includes(item.id)),
    [candidates, selectedIds],
  );
  const selectedSupplierId = selected[0]?.supplierId || null;
  const selectedTotal = selected.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

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

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-orange-600"><WalletCards size={18} /> Supplier Payables</div>
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
                  <div><p className="font-black">{item.code} · {item.supplier?.name}</p><p className="text-xs text-slate-500">ครบกำหนด {date(item.dueDate)} · ใบรับ {item.receipts?.length || 0} ใบ</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass(item.status)}`}>{item.status}</span>
                </div>
                <div className="mt-3 flex justify-between text-sm"><span>ยอดหนี้ {money(item.totalAmount)}</span><strong className="text-rose-600">คงเหลือ {money(item.outstandingAmount)}</strong></div>
              </div>
            ))}
            {!loading && !payables.length && <div className="p-8 text-center text-sm text-slate-500">ยังไม่มีรายการเจ้าหนี้</div>}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div><h2 className="font-black">ตั้งหนี้จากใบรับสินค้า</h2><p className="text-xs text-slate-500">เลือกได้หลายใบ แต่ต้องเป็น Supplier เดียวกัน</p></div>
          <div className="max-h-80 space-y-2 overflow-auto">
            {candidates.map((item) => (
              <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 hover:bg-orange-50">
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
    </section>
  );
};

export default SupplierPayableWorkspacePage;
