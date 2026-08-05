import { LayoutTemplate, Megaphone, Store, Unplug } from 'lucide-react';

const NAV_ITEMS = [
  ['identity', 'ภาพลักษณ์ร้าน', 'ชื่อร้าน URL และข้อมูลติดต่อ', Store],
  ['media', 'สื่อและแบนเนอร์', 'โลโก้ ภาพปก และโปรโมชั่น', Megaphone],
  ['homepage', 'เนื้อหาหน้าหลัก', 'เปิดหรือซ่อนส่วนประกอบ', LayoutTemplate],
];

const StoreStudioNavigation = ({ activePanel, isLive, busy, onSelectPanel, onUnpublish }) => (
  <aside className="space-y-4">
    <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-400">พื้นที่จัดการ</p>
      {NAV_ITEMS.map(([value, label, description, Icon]) => (
        <button key={value} type="button" onClick={() => onSelectPanel(value)} className={`mt-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${activePanel === value ? 'bg-orange-50 text-orange-800' : 'text-slate-700 hover:bg-slate-50'}`}>
          <span className={`mt-0.5 rounded-xl p-2 ${activePanel === value ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="h-4 w-4" /></span>
          <span><span className="block text-sm font-black">{label}</span><span className="mt-0.5 block text-xs leading-5 text-slate-400">{description}</span></span>
        </button>
      ))}
    </section>
    {isLive ? <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-start gap-3"><Unplug className="mt-0.5 h-5 w-5 text-amber-700" /><div><h2 className="font-black text-amber-950">การเปิดหน้าร้าน</h2><p className="mt-1 text-xs leading-5 text-amber-800">การบันทึกแบบร่างจะไม่ทำให้หน้าร้านที่เผยแพร่อยู่ปิดลง</p><button type="button" onClick={onUnpublish} disabled={busy} className="mt-4 text-xs font-black text-amber-800 underline underline-offset-4">ปิดหน้าร้านสาธารณะ</button></div></div></section> : null}
  </aside>
);

export default StoreStudioNavigation;
