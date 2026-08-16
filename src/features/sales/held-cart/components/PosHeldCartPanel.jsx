import React, { useEffect, useState } from 'react';
import { Archive, RefreshCw, Search, X } from 'lucide-react';
import { feedback } from '@/design-system/feedback';
import {
  cancelPosHeldCart,
  createPosHeldCart,
  getPosHeldCartErrorMessage,
  listPosHeldCarts,
} from '../api/posHeldCartApi';

const money = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
}).format(Number(value || 0));

const inputClass =
  'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100';

const PosHeldCartPanel = ({
  open,
  onClose,
  currentItems,
  currentCustomerId,
  currentPriceType,
  onLoad,
  onSavedAndClear,
}) => {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [form, setForm] = useState({ customerName: '', customerPhone: '', note: '' });

  const load = async () => {
    setLoading(true);
    try {
      const result = await listPosHeldCarts({ query });
      setRows(Array.isArray(result) ? result : []);
    } catch (error) {
      feedback.actionError(error, getPosHeldCartErrorMessage(error), 'held-cart:list:error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const saveCurrent = async () => {
    if (saving) return;
    if (!currentItems.length) {
      feedback.info('ยังไม่มีสินค้าให้พักรายการ');
      return;
    }
    setSaving(true);
    try {
      const cart = await createPosHeldCart({
        ...form,
        customerId: currentCustomerId || null,
        priceType: currentPriceType,
        items: currentItems,
      });
      feedback.actionSuccess(`บันทึกใบพัก ${cart.code} แล้ว`, 'held-cart:create:success');
      setForm({ customerName: '', customerPhone: '', note: '' });
      await load();
      onSavedAndClear(cart);
      onClose();
    } catch (error) {
      feedback.actionError(error, getPosHeldCartErrorMessage(error), 'held-cart:create:error');
    } finally {
      setSaving(false);
    }
  };

  const requestCancel = (heldCartId) => {
    if (cancellingId) return;
    setPendingCancelId(heldCartId);
    setCancelReason('');
  };

  const closeCancel = () => {
    if (cancellingId) return;
    setPendingCancelId(null);
    setCancelReason('');
  };

  const confirmCancel = async (heldCartId) => {
    const reason = cancelReason.trim();
    if (!reason) {
      feedback.info('กรุณาระบุเหตุผลยกเลิกใบพักรายการ');
      return;
    }
    if (cancellingId) return;

    setCancellingId(heldCartId);
    try {
      await cancelPosHeldCart(heldCartId, reason);
      feedback.actionSuccess('ยกเลิกใบพักรายการแล้ว', `held-cart:cancel:${heldCartId}:success`);
      setPendingCancelId(null);
      setCancelReason('');
      await load();
    } catch (error) {
      feedback.actionError(error, getPosHeldCartErrorMessage(error), `held-cart:cancel:${heldCartId}:error`);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/40" role="dialog" aria-modal="true" aria-label="ใบพักรายการขาย">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 shadow-xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-teal-200 bg-teal-50 px-4 py-3 sm:px-5">
          <div>
            <h2 className="font-semibold text-teal-950">ใบพักรายการขาย</h2>
            <p className="mt-0.5 text-xs text-teal-800">บันทึกรายการไว้และกลับมาทำต่อภายหลัง</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || Boolean(cancellingId)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-900 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="ปิดใบพักรายการขาย"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-4 p-3 sm:p-5">
          <section className="rounded-2xl border border-teal-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-900">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100">
                <Archive className="h-4 w-4" />
              </span>
              พักรายการปัจจุบัน ({currentItems.length} รายการ)
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                placeholder="ชื่อเรียกลูกค้า (ถ้ามี)"
                className={inputClass}
              />
              <input
                value={form.customerPhone}
                onChange={(event) => setForm({ ...form, customerPhone: event.target.value })}
                placeholder="เบอร์โทร (ถ้ามี)"
                className={inputClass}
              />
            </div>
            <input
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="หมายเหตุ เช่น รอเลือกรายการสินค้าเพิ่ม"
              className={`${inputClass} mt-3`}
            />
            <button
              type="button"
              onClick={saveCurrent}
              disabled={!currentItems.length || saving}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกและเริ่มรายการขายใหม่'}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && load()}
                  placeholder="ค้นหารหัส ชื่อ หรือเบอร์โทร"
                  className={`${inputClass} pl-10`}
                />
              </div>
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 text-sm font-semibold text-teal-900 transition hover:bg-teal-100 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                ค้นหา
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {rows.map((cart) => {
                const cancelOpen = pendingCancelId === cart.id;
                const cancelling = cancellingId === cart.id;
                return (
                  <article key={cart.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">{cart.code}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {cart.customerName || cart.registeredCustomerName || 'ไม่ระบุลูกค้า'} · {cart.customerPhone || 'ไม่มีเบอร์'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {cart.itemCount} รายการ · แก้ล่าสุด {new Date(cart.lastActivityAt).toLocaleString('th-TH')}
                        </p>
                      </div>
                      <strong className="font-mono text-emerald-800">{money(cart.totalAmount)}</strong>
                    </div>

                    {cancelOpen && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
                        <label className="text-xs font-semibold text-rose-800" htmlFor={`held-cart-cancel-${cart.id}`}>
                          เหตุผลยกเลิกใบพักรายการ
                        </label>
                        <textarea
                          id={`held-cart-cancel-${cart.id}`}
                          value={cancelReason}
                          onChange={(event) => setCancelReason(event.target.value)}
                          disabled={cancelling}
                          rows={2}
                          className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                          placeholder="ระบุเหตุผลก่อนยืนยันยกเลิก"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                          <button type="button" onClick={closeCancel} disabled={cancelling} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                            ไม่ยกเลิก
                          </button>
                          <button type="button" onClick={() => confirmCancel(cart.id)} disabled={cancelling || !cancelReason.trim()} className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                            {cancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิก'}
                          </button>
                        </div>
                      </div>
                    )}

                    {!cancelOpen && (
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                        <button
                          type="button"
                          onClick={() => requestCancel(cart.id)}
                          disabled={Boolean(cancellingId)}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                        >
                          ยกเลิก
                        </button>
                        <button
                          type="button"
                          onClick={() => onLoad(cart.id)}
                          disabled={Boolean(cancellingId)}
                          className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-100 px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-200 disabled:opacity-50"
                        >
                          เปิดทำต่อ
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}

              {!loading && !rows.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                  <p className="font-medium text-slate-700">ไม่มีใบพักรายการที่เปิดอยู่</p>
                  <p className="mt-1 text-sm text-slate-500">รายการที่บันทึกไว้จะแสดงในพื้นที่นี้</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PosHeldCartPanel;
