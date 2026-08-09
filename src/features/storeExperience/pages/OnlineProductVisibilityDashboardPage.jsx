import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOnlineProductVisibilityAudit, updateOnlineProductPrice } from '../api/storeExperienceApi';

const REASON_LABELS = {
  PRODUCT_INACTIVE: 'สินค้าปิดใช้งาน', PRICE_INACTIVE: 'ราคาของร้านปิดใช้งาน',
  MISSING_ONLINE_PRICE: 'ยังไม่มีราคาออนไลน์', PRICE_NOT_STARTED: 'ราคายังไม่ถึงวันเริ่มใช้',
  PRICE_EXPIRED: 'ราคาออนไลน์หมดอายุแล้ว', BRAND_INACTIVE: 'แบรนด์ปิดใช้งาน',
  TAXONOMY_INACTIVE: 'หมวดหมู่หรือประเภทสินค้าไม่พร้อม', OUT_OF_STOCK: 'ไม่มีสต๊อกพร้อมขาย',
};
const STATUS_OPTIONS = [['ALL', 'ทั้งหมด'], ['SELLABLE_NOW', 'พร้อมขาย'], ['VISIBLE_OUT_OF_STOCK', 'แสดงได้แต่หมดสต๊อก'], ['BLOCKED', 'ถูกบล็อก']];
const dateValue = (value) => value ? String(value).slice(0, 10) : '';

const SummaryCard = ({ label, value, tone = 'slate' }) => {
  const tones = { slate: 'border-slate-200 bg-white text-slate-900', emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900', blue: 'border-blue-200 bg-blue-50 text-blue-900', amber: 'border-amber-200 bg-amber-50 text-amber-900', red: 'border-red-200 bg-red-50 text-red-900' };
  return <div className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}><p className="text-xs font-bold uppercase tracking-[0.14em] opacity-60">{label}</p><p className="mt-2 text-3xl font-black">{Number(value || 0).toLocaleString('th-TH')}</p></div>;
};

const StatusBadge = ({ status }) => {
  const config = { SELLABLE_NOW: ['พร้อมขาย', 'bg-emerald-100 text-emerald-700'], VISIBLE_OUT_OF_STOCK: ['แสดงได้ · หมดสต๊อก', 'bg-amber-100 text-amber-700'], BLOCKED: ['ถูกบล็อก', 'bg-red-100 text-red-700'] };
  const [label, className] = config[status] || [status, 'bg-slate-100 text-slate-600'];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>;
};

const OnlineProductVisibilityDashboardPage = () => {
  const { shopSlug } = useParams();
  const [audit, setAudit] = useState(null);
  const [state, setState] = useState({ loading: true, error: '', success: '' });
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ priceOnline: '', isActive: true, effectiveDate: '', expiredDate: '' });

  const load = async (success = '') => {
    setState({ loading: true, error: '', success });
    try {
      const data = await getOnlineProductVisibilityAudit();
      setAudit(data);
      setState({ loading: false, error: '', success });
    } catch (error) {
      setState({ loading: false, error: error?.response?.data?.message || error.message || 'ไม่สามารถโหลดสถานะสินค้าออนไลน์ได้', success: '' });
    }
  };
  useEffect(() => { load(); }, []);

  const openEditor = (item) => {
    setEditing(item);
    setForm({ priceOnline: item.priceOnline ?? '', isActive: item.priceActive !== false, effectiveDate: dateValue(item.effectiveDate), expiredDate: dateValue(item.expiredDate) });
  };
  const saveEditor = async () => {
    try {
      setState((current) => ({ ...current, error: '', success: '' }));
      await updateOnlineProductPrice(editing.productId, {
        priceOnline: form.priceOnline === '' ? 0 : Number(form.priceOnline),
        isActive: Boolean(form.isActive),
        effectiveDate: form.effectiveDate || null,
        expiredDate: form.expiredDate || null,
      });
      setEditing(null);
      await load('บันทึกการตั้งค่าสินค้าออนไลน์และตรวจสถานะใหม่แล้ว');
    } catch (error) {
      setState((current) => ({ ...current, error: error?.response?.data?.message || error.message || 'บันทึกไม่สำเร็จ', success: '' }));
    }
  };

  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (audit?.items || []).filter((item) => {
      if (filter !== 'ALL' && item.status !== filter) return false;
      if (!normalized) return true;
      return [item.name, item.barcode, item.brand?.name, item.productType?.name, item.category?.name].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [audit?.items, filter, query]);

  if (state.loading) return <div className="rounded-2xl bg-white p-8 text-center shadow-sm">กำลังตรวจสอบสินค้าออนไลน์ของร้าน...</div>;

  return <div className="space-y-6 p-4 md:p-6">
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Marketplace Control Center</p><h1 className="mt-1 text-2xl font-black text-slate-900">จัดการความพร้อมของสินค้าออนไลน์</h1><p className="mt-1 text-sm text-slate-500">ตรวจสอบและแก้ราคาออนไลน์จากศูนย์ควบคุม โดยไม่แตะต้นทุนหรือราคาช่องทางอื่น</p></div>
      <div className="flex flex-wrap gap-2"><Link to={`/${shopSlug}/pos/settings/storefront`} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50">ออกแบบหน้าร้าน</Link><Link to={`/${shopSlug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">ดูหน้าร้านจริง</Link><button type="button" onClick={() => load()} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">ตรวจใหม่</button></div>
    </section>
    {state.error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div> : null}
    {state.success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.success}</div> : null}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><SummaryCard label="รายการที่ตรวจ" value={audit?.summary?.totalCandidates} /><SummaryCard label="แสดงออนไลน์" value={audit?.summary?.visibleOnline} tone="blue" /><SummaryCard label="พร้อมขายตอนนี้" value={audit?.summary?.sellableNow} tone="emerald" /><SummaryCard label="แสดงได้แต่หมดสต๊อก" value={audit?.summary?.visibleOutOfStock} tone="amber" /><SummaryCard label="ถูกบล็อก" value={audit?.summary?.blocked} tone="red" /></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-900">สาเหตุที่ต้องจัดการ</h2><p className="text-sm text-slate-500">หนึ่งสินค้าอาจมีหลายสาเหตุ</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(audit?.summary?.reasonCounts || {}).map(([reason, count]) => <div key={reason} className="rounded-xl border border-slate-200 px-3 py-2"><p className="text-[11px] font-bold text-slate-500">{REASON_LABELS[reason] || reason}</p><p className="mt-1 text-xl font-black">{count}</p></div>)}</div></section>
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{STATUS_OPTIONS.map(([value, label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-xl px-3 py-2 text-sm font-bold transition ${filter === value ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>{label}</button>)}</div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อสินค้า บาร์โค้ด แบรนด์ หรือหมวดหมู่" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 lg:max-w-md" /></div></div>
      <div className="divide-y divide-slate-100">{items.length ? items.map((item) => <article key={item.productId} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_160px_130px_110px] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-slate-900">{item.name}</h3><StatusBadge status={item.status} /></div><p className="mt-1 text-xs text-slate-500">{[item.barcode, item.brand?.name, item.productType?.name, item.category?.name].filter(Boolean).join(' · ')}</p><div className="mt-3 flex flex-wrap gap-2">{(item.reasons || []).length ? item.reasons.map((reason) => <span key={reason} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${reason === 'OUT_OF_STOCK' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{REASON_LABELS[reason] || reason}</span>) : <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">ผ่านทุกเงื่อนไขออนไลน์</span>}</div></div><div><p className="text-xs font-bold text-slate-400">ราคาออนไลน์</p><p className="mt-1 text-xl font-black">{item.priceOnline > 0 ? `฿${Number(item.priceOnline).toLocaleString('th-TH')}` : 'ยังไม่กำหนด'}</p></div><div><p className="text-xs font-bold text-slate-400">สต๊อกพร้อมขาย</p><p className="mt-1 text-xl font-black">{Number(item.availableQuantity || 0).toLocaleString('th-TH')}</p></div><button type="button" onClick={() => openEditor(item)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">จัดการ</button></article>) : <div className="p-10 text-center text-sm text-slate-500">ไม่พบสินค้าที่ตรงกับตัวกรอง</div>}</div>
    </section>
    {editing ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-black text-slate-900">จัดการสินค้าออนไลน์</h2><p className="mt-1 text-sm text-slate-500">{editing.name}</p><div className="mt-5 grid gap-4"><label className="text-sm font-bold text-slate-700">ราคาออนไลน์<input type="number" min="0" step="0.01" value={form.priceOnline} onChange={(e) => setForm((c) => ({ ...c, priceOnline: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label><label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"><span>เปิดใช้งานราคาของร้าน</span><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((c) => ({ ...c, isActive: e.target.checked }))} className="accent-emerald-600" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">เริ่มใช้ราคา<input type="date" value={form.effectiveDate} onChange={(e) => setForm((c) => ({ ...c, effectiveDate: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label><label className="text-sm font-bold text-slate-700">สิ้นสุดราคา<input type="date" value={form.expiredDate} onChange={(e) => setForm((c) => ({ ...c, expiredDate: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" /></label></div></div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold">ยกเลิก</button><button type="button" onClick={saveEditor} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">บันทึกและตรวจใหม่</button></div></div></div> : null}
  </div>;
};

export default OnlineProductVisibilityDashboardPage;
