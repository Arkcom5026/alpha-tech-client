import { Eye, Globe2, Save, Store } from 'lucide-react';

const actionClass = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60';

const StoreStudioHeader = ({
  isLive,
  hasDraftChanges,
  storefrontSlug,
  busy,
  onPreview,
  onSave,
  onPublish,
}) => (
  <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-5 border-b border-slate-100 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-orange-700"><Store className="h-3.5 w-3.5" /> Online Store Studio</span>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${isLive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{isLive ? 'เผยแพร่แล้ว' : 'แบบร่าง'}</span>
          {hasDraftChanges ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">มีแบบร่างที่ยังไม่เผยแพร่</span> : null}
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">จัดการภาพลักษณ์และเนื้อหาหน้าร้าน</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">ร้านปรับโลโก้ ภาพ แบนเนอร์ โปรโมชั่น และเนื้อหาได้เต็มที่ โดยใช้มาตรฐานภาพและประสบการณ์เดียวกับแพลตฟอร์ม</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onPreview} className={`${actionClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}><Eye className="h-4 w-4" />ดูหน้าร้านจริง</button>
        <button type="button" onClick={onSave} disabled={busy} className={`${actionClass} bg-slate-900 text-white hover:bg-slate-800`}><Save className="h-4 w-4" />บันทึกแบบร่าง</button>
        <button type="button" onClick={onPublish} disabled={busy} className={`${actionClass} bg-orange-500 text-white hover:bg-orange-600`}><Globe2 className="h-4 w-4" />{isLive ? 'เผยแพร่การเปลี่ยนแปลง' : 'เผยแพร่หน้าร้าน'}</button>
      </div>
    </div>
    <div className="grid gap-3 bg-slate-50 px-6 py-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-400">สถานะหน้าร้าน</p><p className="mt-1 font-black text-slate-900">{isLive ? 'ลูกค้าเข้าชมได้' : 'ยังไม่เปิดสาธารณะ'}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-400">URL ร้าน</p><p className="mt-1 truncate font-black text-slate-900">/{storefrontSlug || 'ยังไม่ได้กำหนด'}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3"><p className="text-xs font-bold text-slate-400">มาตรฐานการแสดงผล</p><p className="mt-1 font-black text-slate-900">Alpha-Tech Platform Theme</p></div>
    </div>
  </section>
);

export default StoreStudioHeader;
