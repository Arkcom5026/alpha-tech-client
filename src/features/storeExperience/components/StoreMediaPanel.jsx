import { ImagePlus } from 'lucide-react';

const MEDIA_SLOTS = [
  ['โลโก้ร้าน', 'สัดส่วนแนะนำ 1:1', 'เตรียมสำหรับ Increment Media Library'],
  ['ภาพปกหน้าร้าน', 'สัดส่วนแนะนำ 16:9', 'เตรียมสำหรับ Increment Hero Banner'],
  ['แบนเนอร์โปรโมชั่น', 'ใช้สื่อสารแคมเปญสำคัญ', 'เตรียมสำหรับ Increment Promotion Studio'],
  ['ภาพโฆษณาย่อย', 'ใช้เสริมเนื้อหาในหน้าหลัก', 'เตรียมสำหรับ Increment Content Blocks'],
];

const StoreMediaPanel = () => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <span className="rounded-2xl bg-orange-50 p-3 text-orange-600"><ImagePlus className="h-5 w-5" /></span>
      <div>
        <h2 className="text-lg font-black text-slate-950">สื่อและแบนเนอร์</h2>
        <p className="mt-1 text-sm text-slate-500">พื้นที่สำหรับโลโก้ ภาพหน้าร้าน แบนเนอร์ และสื่อโปรโมชั่น</p>
      </div>
    </div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {MEDIA_SLOTS.map(([title, description, status]) => (
        <div key={title} className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-white p-2.5 text-slate-500 shadow-sm"><ImagePlus className="h-5 w-5" /></span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-slate-500">กำลังพัฒนา</span>
          </div>
          <h3 className="mt-4 font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
          <p className="mt-4 text-xs font-bold text-orange-600">{status}</p>
        </div>
      ))}
    </div>
  </section>
);

export default StoreMediaPanel;
