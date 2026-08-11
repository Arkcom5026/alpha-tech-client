import React, { useMemo, useState } from 'react';
import { Search, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCustomerMoneyReceiveCustomerSearch } from '@/features/customerMoneyReceive/customer/useCustomerMoneyReceiveCustomerSearch';
import { createDeliveryCreditSettlement, getEligibleDeliveryCredits } from '../api/deliveryCreditSettlementApi';

const customerLabel = (customer) => customer?.companyName || customer?.name || '-';
const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const lineKey = (saleId, line) => `${saleId}:${line.lineType}:${line.saleItemId}`;

const DeliveryCreditSettlementCreatePage = () => {
  const navigate = useNavigate();
  const customerSearch = useCustomerMoneyReceiveCustomerSearch();
  const [workspace, setWorkspace] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [creditError, setCreditError] = useState('');
  const [selected, setSelected] = useState({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCredits = async (customer) => {
    setLoadingCredits(true);
    setCreditError('');
    setSelected({});
    try {
      setWorkspace(await getEligibleDeliveryCredits({ customerId: customer.id, take: 200 }));
    } catch (err) {
      setWorkspace(null);
      setCreditError(err?.response?.data?.message || err?.message || 'โหลดใบส่งของเครดิตไม่สำเร็จ');
    } finally {
      setLoadingCredits(false);
    }
  };

  const chooseCustomer = async (customer) => {
    customerSearch.select(customer);
    await loadCredits(customer);
  };

  const setLineAmount = (sale, line, value) => {
    const key = lineKey(sale.id, line);
    setSelected((prev) => {
      const usedByOtherLines = Object.entries(prev).reduce((sum, [existingKey, entry]) => {
        if (existingKey === key || !entry || entry.saleId !== sale.id) return sum;
        return sum + Number(entry.amount || 0);
      }, 0);
      const usedByOtherSelections = Object.entries(prev).reduce((sum, [existingKey, entry]) => {
        if (existingKey === key || !entry) return sum;
        return sum + Number(entry.amount || 0);
      }, 0);
      const remainingSaleCapacity = Math.max(0, Number(sale.outstandingAmount) - usedByOtherLines);
      const remainingCustomerMoney = Math.max(0, Number(workspace?.balance?.availableAmount || 0) - usedByOtherSelections);
      const limit = Math.min(Number(line.remainingAmount ?? line.lineAmount), remainingSaleCapacity, remainingCustomerMoney);
      const amount = Math.min(Math.max(0, Number(value) || 0), limit);
      return {
        ...prev,
        [key]: amount > 0 ? { saleId: sale.id, saleItemId: line.saleItemId, lineType: line.lineType, amount } : undefined,
      };
    });
  };

  const selectWholeSale = (sale) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const [key, entry] of Object.entries(next)) {
        if (entry?.saleId === sale.id) delete next[key];
      }

      let remainingSaleCapacity = Number(sale.outstandingAmount || 0);
      for (const line of sale.lines || []) {
        if (remainingSaleCapacity <= 0) break;
        const remainingLineAmount = Math.max(0, Number(line.remainingAmount ?? line.lineAmount));
        const amount = Math.min(remainingLineAmount, remainingSaleCapacity);
        if (amount <= 0) continue;
        next[lineKey(sale.id, line)] = {
          saleId: sale.id,
          saleItemId: line.saleItemId,
          lineType: line.lineType,
          amount: Number(amount.toFixed(2)),
        };
        remainingSaleCapacity = Number((remainingSaleCapacity - amount).toFixed(2));
      }
      return next;
    });
  };

  const clearWholeSale = (saleId) => {
    setSelected((prev) => {
      const next = { ...prev };
      for (const [key, entry] of Object.entries(next)) {
        if (entry?.saleId === saleId) delete next[key];
      }
      return next;
    });
  };

  const selectedLines = useMemo(() => Object.values(selected).filter(Boolean), [selected]);
  const selectedTotal = useMemo(() => selectedLines.reduce((sum, line) => sum + Number(line.amount || 0), 0), [selectedLines]);
  const selectedBySale = useMemo(() => selectedLines.reduce((map, line) => {
    map.set(line.saleId, (map.get(line.saleId) || 0) + Number(line.amount || 0));
    return map;
  }, new Map()), [selectedLines]);
  const balance = Number(workspace?.balance?.availableAmount || 0);
  const overBalance = selectedTotal > balance + 0.001;
  const canSubmit = selectedLines.length > 0 && selectedTotal > 0 && !overBalance && !saving;

  const submit = async () => {
    if (!canSubmit || !customerSearch.selectedCustomer) return;
    setSaving(true);
    setCreditError('');
    try {
      const result = await createDeliveryCreditSettlement({
        customerId: customerSearch.selectedCustomer.id,
        note: note.trim() || null,
        lines: selectedLines,
      });
      navigate(`../${result.id}`);
    } catch (err) {
      setCreditError(err?.response?.data?.message || err?.message || 'ตัดยอดใบส่งของไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 md:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ตัดยอดใบส่งของเครดิต</h1>
          <p className="text-sm text-slate-500">นำ Customer Money ไปใช้กับใบส่งของเครดิต โดยไม่สร้าง stock movement ใหม่</p>
        </div>
        <button type="button" onClick={() => navigate('..')} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">กลับรายการ</button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">เลือกลูกค้า</h2>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={customerSearch.query} onChange={(e) => customerSearch.setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); customerSearch.submit(); } }} placeholder="ชื่อ เบอร์โทร บริษัท อีเมล หรือเลขผู้เสียภาษี" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3" />
          </div>
          <button type="button" onClick={customerSearch.submit} disabled={customerSearch.loading} className="rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white disabled:opacity-50">ค้นหา</button>
        </div>
        {customerSearch.error && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{customerSearch.error}</div>}
        {customerSearch.results.length > 0 && <div className="mt-3 grid gap-2 md:grid-cols-2">{customerSearch.results.map((customer) => <button key={customer.id} type="button" onClick={() => chooseCustomer(customer)} className="rounded-xl border border-slate-200 p-3 text-left hover:border-indigo-300"><div className="font-semibold">{customerLabel(customer)}</div><div className="text-xs text-slate-500">{[customer.phone, customer.email, customer.taxId].filter(Boolean).join(' · ')}</div></button>)}</div>}
      </section>

      {customerSearch.selectedCustomer && (
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">ลูกค้า</div><div className="mt-1 font-bold text-slate-900">{customerLabel(customerSearch.selectedCustomer)}</div></div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><WalletCards className="h-4 w-4" /> Customer Money พร้อมใช้</div><div className="mt-1 text-3xl font-bold text-emerald-950">฿{money(balance)}</div></div>
        </section>
      )}

      {creditError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{creditError}</div>}
      {loadingCredits && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">กำลังโหลดใบส่งของเครดิต...</div>}

      {workspace && !loadingCredits && (
        <section className="space-y-3">
          {workspace.sales.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">ไม่พบใบส่งของเครดิตที่ยังมียอดค้าง</div> : workspace.sales.map((sale) => {
            const saleSelectedAmount = Number((selectedBySale.get(sale.id) || 0).toFixed(2));
            const isWholeSaleSelected = saleSelectedAmount > 0 && Math.abs(saleSelectedAmount - Number(sale.outstandingAmount || 0)) < 0.01;
            const selectedOutsideSale = Math.max(0, selectedTotal - saleSelectedAmount);
            const customerMoneyAvailableForSale = Math.max(0, balance - selectedOutsideSale);
            const canSelectWholeSale = Number(sale.outstandingAmount || 0) <= customerMoneyAvailableForSale + 0.001;
            return (
              <article key={sale.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div><div className="font-bold text-slate-900">{sale.documentNo}</div><div className="text-xs text-slate-500">ยอดเอกสาร ฿{money(sale.totalAmount)} · ชำระแล้ว ฿{money(sale.paidAmount)} · เลือกแล้ว ฿{money(saleSelectedAmount)}</div></div>
                  <div className="flex items-center gap-3">
                    <div className="text-right"><div className="text-xs text-slate-500">ยอดค้าง</div><div className="text-xl font-bold text-rose-700">฿{money(sale.outstandingAmount)}</div></div>
                    <button
                      type="button"
                      onClick={() => (isWholeSaleSelected ? clearWholeSale(sale.id) : selectWholeSale(sale))}
                      disabled={!isWholeSaleSelected && !canSelectWholeSale}
                      title={!isWholeSaleSelected && !canSelectWholeSale ? 'Customer Money ที่เหลือไม่พอสำหรับตัดยอดทั้งใบ' : undefined}
                      className={`h-10 rounded-xl border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${isWholeSaleSelected ? 'border-slate-300 bg-white text-slate-700' : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
                    >
                      {isWholeSaleSelected ? 'ล้างทั้งใบ' : canSelectWholeSale ? 'เลือกทั้งใบ' : 'เงินไม่พอทั้งใบ'}
                    </button>
                  </div>
                </header>
                <div className="divide-y divide-slate-100">
                  {sale.lines.map((line) => {
                    const key = lineKey(sale.id, line);
                    const remaining = Number(line.remainingAmount ?? line.lineAmount);
                    return <div key={key} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_150px_160px] md:items-center"><div><div className="font-medium text-slate-900">{line.description}</div><div className="text-xs text-slate-500">{line.lineType} · จำนวน {line.quantity} · มูลค่า ฿{money(line.lineAmount)} · เคยตัด ฿{money(line.appliedAmount)}</div></div><div className="text-right text-sm font-semibold text-rose-700">คงเหลือ ฿{money(remaining)}</div><input type="number" min="0" max={Math.min(remaining, sale.outstandingAmount)} step="0.01" value={selected[key]?.amount ?? ''} onChange={(e) => setLineAmount(sale, line, e.target.value)} placeholder="ยอดที่จะตัด" className="h-10 rounded-lg border border-slate-300 px-3 text-right" /></div>;
                  })}
                </div>
              </article>
            );
          })}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder="หมายเหตุการตัดยอด (ถ้ามี)" className="w-full rounded-xl border border-slate-300 p-3" />
        </section>
      )}

      {workspace && (
        <section className="sticky bottom-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><div className="text-xs text-slate-500">ยอดที่เลือกตัดทั้งหมด</div><div className={`text-2xl font-bold ${overBalance ? 'text-rose-700' : 'text-indigo-800'}`}>฿{money(selectedTotal)}</div>{overBalance && <div className="text-xs text-rose-700">ยอดที่เลือกมากกว่า Customer Money ที่พร้อมใช้</div>}</div>
            <button type="button" onClick={submit} disabled={!canSubmit} className="h-12 rounded-xl bg-indigo-700 px-6 font-semibold text-white disabled:bg-slate-300">{saving ? 'กำลังตัดยอด...' : 'ยืนยันตัดยอดใบส่งของ'}</button>
          </div>
        </section>
      )}
    </div>
  );
};

export default DeliveryCreditSettlementCreatePage;