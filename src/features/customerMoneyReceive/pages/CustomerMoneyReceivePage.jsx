import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, WalletCards } from 'lucide-react';
import { feedback } from '@/design-system';
import { createCustomerMoneyReceive } from '../api/customerMoneyReceiveApi';
import { useCustomerMoneyReceiveCustomerSearch } from '../customer/useCustomerMoneyReceiveCustomerSearch';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';

const customerLabel = getCustomerDisplayName;

const paymentMethods = [
  ['CASH', 'เงินสด'], ['TRANSFER', 'โอนเงิน'], ['QR', 'QR'], ['CARD', 'บัตร'],
  ['E_WALLET', 'E-Wallet'], ['CHEQUE', 'เช็ค'], ['OTHER', 'อื่น ๆ'],
];

const CustomerMoneyReceivePage = () => {
  const navigate = useNavigate();
  const search = useCustomerMoneyReceiveCustomerSearch();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [description, setDescription] = useState('');
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => (
    Boolean(search.selectedCustomer?.id) && Number(amount) > 0 && Boolean(description.trim()) && !saving
  ), [amount, description, saving, search.selectedCustomer]);

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError('');
    try {
      const created = await createCustomerMoneyReceive({
        customerId: search.selectedCustomer.id,
        amount: Number(amount),
        paymentMethod,
        paymentReference: paymentReference.trim() || null,
        description: description.trim(),
        receivedAt: new Date(receivedAt).toISOString(),
      });
      feedback.actionSuccess(
        'บันทึกรับเงินจากลูกค้าเรียบร้อยแล้ว',
        `customer-money-receive:${created?.id || search.selectedCustomer.id}:create:success`,
      );
      navigate(`../${created.id}`);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'บันทึกรับเงินไม่สำเร็จ';
      setError(message);
      feedback.actionError(
        err,
        message,
        `customer-money-receive:${search.selectedCustomer?.id || 'unknown'}:create:error`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-3 md:p-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-100 p-2 text-teal-800"><WalletCards className="h-5 w-5" /></div>
          <div><h1 className="text-xl font-bold text-slate-900">รับเงินจากลูกค้า</h1><p className="text-sm text-slate-500">รับเงินจริงเข้า Customer Money โดยยังไม่กำหนดว่าจะนำไปใช้กับรายการใด</p></div>
        </div>
        <button type="button" onClick={() => navigate('..')} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700"><ArrowLeft className="h-4 w-4" /> กลับประวัติการรับเงิน</button>
      </header>

      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">ข้อมูลลูกค้า</h2>
          <div className="flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input autoFocus value={search.query} onChange={(e) => search.setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search.submit(); } }} placeholder="ชื่อ เบอร์โทร บริษัท อีเมล หรือเลขผู้เสียภาษี" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 outline-none focus:border-teal-500" /></div>
            <button type="button" onClick={search.submit} disabled={search.loading} className="rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white disabled:opacity-50">ค้นหา</button>
          </div>
          {search.error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{search.error}</div>}
          {search.results.length > 0 && <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-teal-100 bg-teal-50/40 p-2">{search.results.map((customer) => <button key={customer.id} type="button" onClick={() => search.select(customer)} className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-teal-300"><div className="font-semibold text-slate-900">{customerLabel(customer)}</div><div className="mt-1 text-xs text-slate-500">{[customer.phone, customer.email, customer.taxId].filter(Boolean).join(' · ')}</div></button>)}</div>}
          {search.selectedCustomer && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3"><div className="font-semibold text-emerald-950">{customerLabel(search.selectedCustomer)}</div><div className="text-xs text-emerald-800">{[search.selectedCustomer.phone, search.selectedCustomer.email, search.selectedCustomer.taxId].filter(Boolean).join(' · ')}</div><button type="button" onClick={search.clear} className="mt-2 text-xs font-semibold text-teal-800">เปลี่ยนลูกค้า</button></div>}
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-semibold text-slate-900">รายละเอียดการรับเงิน</h2>
          <label className="block text-sm font-medium text-slate-700">ยอดเงิน<input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-lg font-bold" placeholder="0.00" /></label>
          <label className="block text-sm font-medium text-slate-700">วันที่รับเงิน<input type="datetime-local" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" /></label>
          <label className="block text-sm font-medium text-slate-700">ช่องทางรับเงิน<select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3">{paymentMethods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm font-medium text-slate-700">เลขอ้างอิงการชำระ<input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-slate-300 px-3" placeholder="เช่น เลขสลิป / เลขเช็ค (ถ้ามี)" /></label>
          <label className="block text-sm font-medium text-slate-700">รายละเอียดการรับเงิน<textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 p-3" placeholder="รายละเอียดการรับเงินจริง (ยังไม่ผูกวัตถุประสงค์การใช้เงิน)" /></label>
          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          <button type="submit" disabled={!canSubmit} className="h-12 w-full rounded-xl bg-teal-700 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? 'กำลังบันทึก...' : 'ยืนยันรับเงิน'}</button>
        </section>
      </form>
    </div>
  );
};

export default CustomerMoneyReceivePage;
