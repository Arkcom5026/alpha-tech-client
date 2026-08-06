import { Store } from 'lucide-react';

const fieldClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100';

const StoreIdentityPanel = ({ capability, identity, hero, onCapabilityChange, onIdentityChange, onHeroChange }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3"><span className="rounded-2xl bg-orange-50 p-3 text-orange-600"><Store className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-slate-950">ภาพลักษณ์ร้าน</h2><p className="mt-1 text-sm text-slate-500">ข้อมูลหลักและข้อความต้อนรับที่ลูกค้าจะเห็นบนหน้าร้าน</p></div></div>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <label className="text-sm font-bold text-slate-700">ชื่อร้านที่แสดง<input className={fieldClass} value={capability.displayName || ''} onChange={(event) => onCapabilityChange('displayName', event.target.value)} placeholder="เช่น Advance Tech" /></label>
      <label className="text-sm font-bold text-slate-700">URL ร้าน<div className="mt-1.5 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100"><span className="border-r border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-400">saduaksabuy.com/</span><input className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" value={capability.storefrontSlug || ''} onChange={(event) => onCapabilityChange('storefrontSlug', event.target.value)} placeholder="advancetech" /></div></label>
      <label className="text-sm font-bold text-slate-700 md:col-span-2">คำโปรยร้าน<input className={fieldClass} value={identity.tagline || ''} onChange={(event) => onIdentityChange('tagline', event.target.value)} maxLength={100} placeholder="เช่น มือถือและอุปกรณ์ไอทีครบวงจร" /></label>
      <label className="text-sm font-bold text-slate-700 md:col-span-2">คำอธิบายร้าน<textarea className={`${fieldClass} min-h-24 resize-y`} value={identity.shortDescription || ''} onChange={(event) => onIdentityChange('shortDescription', event.target.value)} maxLength={280} placeholder="เล่าให้ลูกค้ารู้จักร้านและจุดเด่นของคุณ" /></label>
      <label className="text-sm font-bold text-slate-700 md:col-span-2">เบอร์ติดต่อ<input className={fieldClass} value={capability.contactPhone || ''} onChange={(event) => onCapabilityChange('contactPhone', event.target.value)} placeholder="เบอร์ที่ลูกค้าสามารถติดต่อร้านได้" /></label>
    </div>
    <div className="mt-8 border-t border-slate-100 pt-6">
      <h3 className="font-black text-slate-950">ข้อความเปิดหน้าร้าน</h3>
      <p className="mt-1 text-sm text-slate-500">กำหนดข้อความ Hero โดยรูปแบบและสีควบคุมด้วยธีมหลักของแพลตฟอร์ม</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700 md:col-span-2">ข้อความนำ<input className={fieldClass} value={hero.eyebrow || ''} onChange={(event) => onHeroChange('eyebrow', event.target.value)} maxLength={60} placeholder="เช่น ยินดีต้อนรับ" /></label>
        <label className="text-sm font-bold text-slate-700 md:col-span-2">หัวข้อหลัก<input className={fieldClass} value={hero.title || ''} onChange={(event) => onHeroChange('title', event.target.value)} maxLength={120} placeholder="เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ" /></label>
        <label className="text-sm font-bold text-slate-700 md:col-span-2">คำอธิบาย Hero<textarea className={`${fieldClass} min-h-24 resize-y`} value={hero.description || ''} onChange={(event) => onHeroChange('description', event.target.value)} maxLength={240} placeholder="อธิบายสิ่งที่ลูกค้าจะได้รับจากร้าน" /></label>
        <label className="text-sm font-bold text-slate-700">ข้อความบนปุ่ม<input className={fieldClass} value={hero.ctaLabel || ''} onChange={(event) => onHeroChange('ctaLabel', event.target.value)} maxLength={40} placeholder="เลือกซื้อสินค้า" /></label>
      </div>
    </div>
  </section>
);

export default StoreIdentityPanel;
