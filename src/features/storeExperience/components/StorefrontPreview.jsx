import { Monitor, Smartphone, Tablet } from 'lucide-react';

const StorefrontPreview = ({ capability, content, enabledSections, mode, onModeChange }) => {
  const widthClass = mode === 'mobile' ? 'max-w-[390px]' : mode === 'tablet' ? 'max-w-[760px]' : 'max-w-none';
  const hero = content?.hero || {};
  const identity = content?.identity || {};

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-slate-900">ตัวอย่างหน้าร้าน</p>
          <p className="mt-0.5 text-xs text-slate-500">ตัวอย่างใช้ธีมมาตรฐานของ Alpha-Tech และอัปเดตจากข้อมูลแบบร่าง</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([nextMode, Icon]) => (
            <button key={nextMode} type="button" onClick={() => onModeChange(nextMode)} className={`rounded-lg p-2 transition ${mode === nextMode ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-auto p-4 md:p-6">
        <div className={`mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all ${widthClass}`}>
          <header className="border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Online Store</p>
                <h2 className="mt-0.5 text-lg font-black text-slate-950">{capability.displayName || 'ชื่อร้านของคุณ'}</h2>
                {identity.tagline ? <p className="mt-1 text-xs text-slate-500">{identity.tagline}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 sm:inline">สินค้า</span>
                <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white">ตะกร้า</span>
              </div>
            </div>
          </header>
          <div className="space-y-6 bg-slate-50 p-4 md:p-6">
            {enabledSections.map((section) => {
              if (section.type === 'HERO') return (
                <div key={section.id} className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-400 p-7 text-white shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">{hero.eyebrow || 'ยินดีต้อนรับ'}</p>
                  <h3 className="mt-3 max-w-xl text-3xl font-black leading-tight">{hero.title || 'เลือกสินค้าที่ใช่ จากร้านที่คุณไว้วางใจ'}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-orange-50">{hero.description || identity.shortDescription || 'ค้นหาสินค้าคุณภาพ พร้อมข้อมูลชัดเจนและการบริการจากร้านโดยตรง'}</p>
                  <span className="mt-5 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-black text-orange-600">{hero.ctaLabel || 'เลือกซื้อสินค้า'}</span>
                </div>
              );
              if (section.type === 'FEATURED_PRODUCTS') return (
                <div key={section.id}>
                  <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-black text-slate-950">สินค้าแนะนำ</h3><span className="text-xs font-black text-orange-600">ดูทั้งหมด</span></div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="aspect-square rounded-xl bg-slate-100" /><p className="mt-3 text-sm font-black text-slate-900">สินค้าตัวอย่าง {item}</p><p className="mt-1 text-sm font-black text-orange-600">฿0</p></div>)}</div>
                </div>
              );
              if (section.type === 'PRODUCT_GRID') return (
                <div key={section.id}><h3 className="mb-3 text-lg font-black text-slate-950">สินค้าทั้งหมด</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-3"><div className="aspect-square rounded-xl bg-slate-100" /><p className="mt-2 text-sm font-black text-slate-900">สินค้า {item}</p></div>)}</div></div>
              );
              if (section.type === 'FULFILLMENT') return <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">รับสินค้าได้อย่างไร</h3><p className="mt-1 text-sm text-slate-600">{capability.pickupInstruction || 'รับสินค้าที่หน้าร้าน'}</p></div>;
              if (section.type === 'CONTACT') return <div key={section.id} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-black text-slate-950">ติดต่อร้าน</h3><p className="mt-1 text-sm text-slate-600">{capability.contactPhone || 'ยังไม่ได้ระบุเบอร์ติดต่อ'}</p></div>;
              return null;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorefrontPreview;
