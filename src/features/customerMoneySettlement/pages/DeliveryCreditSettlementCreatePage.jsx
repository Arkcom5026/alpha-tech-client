import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import { useCustomerMoneyReceiveCustomerSearch } from '@/features/customerMoneyReceive/customer/useCustomerMoneyReceiveCustomerSearch';
import { getCustomerDisplayName } from '@/features/customer/utils/customerDisplayName';
import { createDeliveryCreditSettlement, getEligibleDeliveryCredits } from '../api/deliveryCreditSettlementApi';

const customerLabel = getCustomerDisplayName;
const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const lineKey = (saleId, line) => `${saleId}:${line.lineType}:${line.saleItemId}`;
const createCommandKey = () => globalThis.crypto?.randomUUID?.() || `cms-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const DeliveryCreditSettlementCreatePage = () => {
  const navigate = useNavigate();
  const customerSearch = useCustomerMoneyReceiveCustomerSearch();
  const submitKeyRef = useRef(null);
  const savingRef = useRef(false);
  const mountedRef = useRef(false);
  const creditContextRef = useRef(null);
  const creditRequestRef = useRef(0);
  const createRequestRef = useRef(0);
  const [workspace, setWorkspace] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(false);
  const [creditError, setCreditError] = useState('');
  const [selected, setSelected] = useState({});
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // React StrictMode intentionally runs effect setup/cleanup/setup again in
    // development. Reset the mounted authority on every setup so async results
    // from the active setup can settle the workspace instead of being treated
    // as permanently stale after the first StrictMode cleanup.
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      creditRequestRef.current += 1;
      createRequestRef.current += 1;
    };
  }, []);

  const invalidateSubmitKey = () => {
    if (savingRef.current) return;
    submitKeyRef.current = null;
  };

  const loadCredits = async (customer) => {
    if (savingRef.current) return { ok: false, stale: true };
    const customerIdSnapshot = Number(customer?.id);
    const requestId = ++creditRequestRef.current;
    creditContextRef.current = customerIdSnapshot;
    const ownsRequest = () => mountedRef.current
      && creditRequestRef.current === requestId
      && creditContextRef.current === customerIdSnapshot;

    setLoadingCredits(true);
    setCreditError('');
    setWorkspace(null);
    setSelected({});
    setNote('');
    invalidateSubmitKey();
    try {
      const nextWorkspace = await getEligibleDeliveryCredits({ customerId: customerIdSnapshot, take: 200 });
      if (!ownsRequest()) return { ok: false, stale: true };
      setWorkspace(nextWorkspace);
      return { ok: true, stale: false, workspace: nextWorkspace };
    } catch (err) {
      if (!ownsRequest()) return { ok: false, stale: true };
      const message = err?.response?.data?.message || err?.message || 'โหลดใบส่งของเครดิตไม่สำเร็จ';
      setWorkspace(null);
      setCreditError(message);
      feedback.actionError(err, 'โหลดใบส่งของเครดิตไม่สำเร็จ', `customer-money-settlement:create:${customerIdSnapshot}:credits-load:error`);
      return { ok: false, stale: false, error: message };
    } finally {
      if (ownsRequest()) setLoadingCredits(false);
    }
  };

  const chooseCustomer = async (customer) => {
    if (savingRef.current) return;
    const customerIdSnapshot = Number(customer?.id);
    creditContextRef.current = customerIdSnapshot;
    customerSearch.select(customer);
    await loadCredits(customer);
  };

  const setLineAmount = (sale, line, value) => {
    if (savingRef.current) return;
    invalidateSubmitKey();
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
    if (savingRef.current) return;
    invalidateSubmitKey();
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
    if (savingRef.current) return;
    invalidateSubmitKey();
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
  const balanceLoaded = Boolean(workspace && !loadingCredits);
  const balance = balanceLoaded ? Number(workspace?.balance?.availableAmount || 0) : 0;
  const overBalance = balanceLoaded && selectedTotal > balance + 0.001;
  const canSubmit = balanceLoaded && selectedLines.length > 0 && selectedTotal > 0 && !overBalance && !saving;

  const submit = async () => {
    if (!canSubmit || !customerSearch.selectedCustomer || savingRef.current) return;

    const customerIdSnapshot = customerSearch.selectedCustomer.id;
    const noteSnapshot = note.trim() || null;
    const linesSnapshot = selectedLines.map((line) => ({ ...line }));
    const idempotencyKey = submitKeyRef.current || createCommandKey();
    submitKeyRef.current = idempotencyKey;
    const requestId = ++createRequestRef.current;
    const ownsRequest = () => mountedRef.current && createRequestRef.current === requestId;

    savingRef.current = true;
    setSaving(true);
    setCreditError('');
    try {
      const result = await createDeliveryCreditSettlement({
        customerId: customerIdSnapshot,
        note: noteSnapshot,
        lines: linesSnapshot,
      }, idempotencyKey);
      feedback.actionSuccess('ตัดยอดใบส่งของเครดิตเรียบร้อยแล้ว', `customer-money-settlement:create:${result.id}:success`);
      if (ownsRequest()) navigate(`../${result.id}`);
    } catch (err) {
      const fallbackMessage = 'ตัดยอดใบส่งของไม่สำเร็จ';
      if (ownsRequest()) setCreditError(err?.response?.data?.message || err?.message || fallbackMessage);
      feedback.actionError(err, fallbackMessage, `customer-money-settlement:create:${idempotencyKey}:error`);
    } finally {
      if (ownsRequest()) {
        savingRef.current = false;
        setSaving(false);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 md:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ตัดยอดใบส่งของเครดิต</h1>
          <p className="text-sm text-slate-500">นำ Customer Money ไปใช้กับใบส่งของเครดิต โดยไม่สร้าง stock movement ใหม่</p>
        </div>
        <button type="button" onClick={() => { if (!savingRef.current) navigate('..'); }} disabled={saving} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">กลับรายการ</button>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">เลือกลูกค้า</h2>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input disabled={saving} value={customerSearch.query} onChange={(e) => customerSearch.setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !savingRef.current) { e.preventDefault(); customerSearch.submit(); } }} placeholder="ชื่อ เบอร์โทร บริษัท อีเมล หรือเลขผู้เสียภาษี" className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 disabled:bg-slate-100" />
          </div>
          <button type="button" onClick={customerSearch.submit} disabled={customerSearch.loading || saving} className="rounded-xl bg-indigo-700 px-4 text-sm font-semibold text-white disabled:opacity-50">ค้นหา</button>
        </div>
        {customerSearch.error && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{customerSearch.error}</div>}
        {customerSearch.results.length > 0 && <div className="mt-3 grid gap-2 md:grid-cols-2">{customerSearch.results.map((customer) => <button key={customer.id} type="button" disabled={saving} onClick={() => chooseCustomer(customer)} className="rounded-xl border border-slate-200 p-3 text-left hover:border-indigo-300 disabled:opacity-50"><div className="font-semibold">{customerLabel(customer)}</div><div className="text-xs text-slate-500">{[customer.phone, customer.email, customer.taxId].filter(Boolean).join(' · ')}</div></button>)}</div>}
      </section>

      {customerSearch.selectedCustomer && (
        <section className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">ลูกค้า</div><div className="mt-1 font-bold text-slate-900">{customerLabel(customerSearch.selectedCustomer)}</div></div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><WalletCards className="h-4 w-4" /> Customer Money พร้อมใช้</div>
            {balanceLoaded
              ? <div className="mt-1 text-3xl font-bold text-emerald-950">฿{money(balance)}</div>
              : <div className="mt-2 text-sm font-semibold text-emerald-700">กำลังตรวจสอบยอดพร้อมใช้...</div>}
          </div>
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
                      disabled={saving || (!isWholeSaleSelected && !canSelectWholeSale)}
                      title={!isWholeSaleSelected && !canSelectWholeSale ? 'Customer Money ที่เหลือไม่พอสำหรับตัดยอดทั้งใบ' : undefined}
                      className={`h-10 rounded-xl border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 ${isWholeSaleSelected ? 'border-slate-300 bg-white text-slate-700' : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
                    >
                      {isWholeSaleSelected ? 'ล้างทั้งใบ' : canSelectWholeSale ? 'เลือกทั้งใบ' : 'เงินไม่พอทั้งใบ'}
                    </button>
                  </div>
                </header>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="border-b bg-white text-left text-xs text-slate-500"><th className="px-4 py-2">รายการ</th><th className="px-4 py-2 text-right">ยอดรายการ</th><th className="px-4 py-2 text-right">ตัดแล้ว</th><th className="px-4 py-2 text-right">คงเหลือ</th><th className="px-4 py-2 text-right">ตัดครั้งนี้</th></tr></thead>
                    <tbody>{sale.lines.map((line) => {
                      const key = lineKey(sale.id, line);
                      return <tr key={key} className="border-b last:border-0"><td className="px-4 py-3"><div className="font-medium text-slate-900">{line.description}</div><div className="text-xs text-slate-500">{line.lineType} · จำนวน {line.quantity}</div></td><td className="px-4 py-3 text-right">฿{money(line.lineAmount)}</td><td className="px-4 py-3 text-right">฿{money(line.appliedAmount)}</td><td className="px-4 py-3 text-right font-semibold text-rose-700">฿{money(line.remainingAmount)}</td><td className="px-4 py-3 text-right"><input type="number" min="0" max={line.remainingAmount} step="0.01" disabled={saving || balance <= 0} value={selected[key]?.amount || ''} onChange={(e) => setLineAmount(sale, line, e.target.value)} className="w-32 rounded-lg border border-slate-300 px-2 py-1 text-right disabled:bg-slate-100" /></td></tr>;
                    })}</tbody>
                  </table>
                </div>
              </article>
            );
          })}

          <div className="sticky bottom-3 rounded-2xl border border-slate-300 bg-white p-4 shadow-lg">
            <div className="flex flex-wrap items-end gap-4">
              <label className="min-w-[260px] flex-1 text-sm font-medium text-slate-700">หมายเหตุ<input value={note} disabled={saving} onChange={(e) => { invalidateSubmitKey(); setNote(e.target.value); }} className="mt-1 h-10 w-full rounded-xl border border-slate-300 px-3 disabled:bg-slate-100" /></label>
              <div className="text-right"><div className="text-xs text-slate-500">ยอดตัดครั้งนี้</div><div className="text-2xl font-bold text-slate-950">฿{money(selectedTotal)}</div><div className="text-xs text-slate-500">คงเหลือหลังตัด ฿{money(Math.max(0, balance - selectedTotal))}</div></div>
              <button type="button" disabled={!canSubmit} onClick={submit} className="h-11 rounded-xl bg-indigo-700 px-5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึกการตัดยอด'}</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DeliveryCreditSettlementCreatePage;