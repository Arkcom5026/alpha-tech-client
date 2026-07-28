import React, { useEffect, useState } from 'react';
import { Archive, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  cancelPosHeldCart,
  createPosHeldCart,
  getPosHeldCartErrorMessage,
  listPosHeldCarts,
} from '../api/posHeldCartApi';

const money = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency: 'THB', minimumFractionDigits: 2,
}).format(Number(value || 0));

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
  const [form, setForm] = useState({ customerName: '', customerPhone: '', note: '' });

  const load = async () => {
    setLoading(true);
    try {
      const result = await listPosHeldCarts({ query });
      setRows(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error(getPosHeldCartErrorMessage(error));
    } finally { setLoading(false); }
  };
  useEffect(() => { if (open) load(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null;

  const saveCurrent = async () => {
    if (!currentItems.length) return toast.info('ยังไม่มีสินค้าให้พักรายการ');
    setSaving(true);
    try {
      const cart = await createPosHeldCart({
        ...form,
        customerId: currentCustomerId || null,
        priceType: currentPriceType,
        items: currentItems,
      });
      toast.success(`บันทึกใบพัก ${cart.code} แล้ว`);
      setForm({ customerName: '', customerPhone: '', note: '' });
      await load();
      onSavedAndClear(cart);
      onClose();
    } catch (error) {
      toast.error(getPosHeldCartErrorMessage(error));
    } finally { setSaving(false); }
  };

  const cancel = async (heldCartId) => {
    const reason = window.prompt('ระบุเหตุผลยกเลิกใบพักรายการ');
    if (!reason?.trim()) return;
    try {
      await cancelPosHeldCart(heldCartId, reason.trim());
      toast.success('ยกเลิกใบพักรายการแล้ว');
      await load();
    } catch (error) {
      toast.error(getPosHeldCartErrorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/45">
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-slate-50 shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <div><h2 className="font-black text-slate-900">ใบพักรายการขาย</h2><p className="text-xs text-slate-500">บันทึกไว้และกลับมายิงสินค้าเพิ่มได้ภายหลัง</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button>
        </header>
        <div className="space-y-4 p-4">
          <section className="space-y-3 rounded-2xl border border-orange-200 bg-white p-4">
            <div className="flex items-center gap-2 font-black text-orange-700"><Archive size={17} /> พักรายการปัจจุบัน ({currentItems.length} รายการ)</div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} placeholder="ชื่อเรียกลูกค้า (ถ้ามี)" className="rounded-xl border px-3 py-2 text-sm" />
              <input value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} placeholder="เบอร์โทร (ถ้ามี)" className="rounded-xl border px-3 py-2 text-sm" />
            </div>
            <input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="หมายเหตุ เช่น กำลังเลือกอุปกรณ์เพิ่ม" className="w-full rounded-xl border px-3 py-2 text-sm" />
            <button type="button" onClick={saveCurrent} disabled={!currentItems.length || saving} className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-black text-white disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึกและเปิดหน้าขายใหม่'}</button>
          </section>
          <section className="space-y-3 rounded-2xl border bg-white p-4">
            <div className="flex gap-2">
              <div className="relative flex-1"><Search size={16} className="absolute left-3 top-2.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="ค้นหารหัส ชื่อ หรือเบอร์โทร" className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" /></div>
              <button type="button" onClick={load} disabled={loading} className="rounded-xl border px-3"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button>
            </div>
            <div className="divide-y">
              {rows.map((cart) => (
                <div key={cart.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div><strong>{cart.code}</strong><p className="text-xs text-slate-500">{cart.customerName || cart.registeredCustomerName || 'ไม่ระบุลูกค้า'} · {cart.customerPhone || 'ไม่มีเบอร์'} · {cart.itemCount} รายการ</p><p className="text-[10px] text-slate-400">แก้ล่าสุด {new Date(cart.lastActivityAt).toLocaleString('th-TH')}</p></div>
                    <strong>{money(cart.totalAmount)}</strong>
                  </div>
                  <div className="mt-2 flex justify-end gap-3"><button type="button" onClick={() => cancel(cart.id)} className="text-xs font-black text-rose-600">ยกเลิก</button><button type="button" onClick={() => onLoad(cart.id)} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white">เปิดทำต่อ</button></div>
                </div>
              ))}
              {!loading && !rows.length && <p className="py-8 text-center text-sm text-slate-500">ไม่มีใบพักรายการที่เปิดอยู่</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PosHeldCartPanel;
