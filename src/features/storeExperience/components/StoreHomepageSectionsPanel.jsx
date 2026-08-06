import { LayoutTemplate } from 'lucide-react';

const StoreHomepageSectionsPanel = ({ sectionOptions, sections, onToggle }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-3">
      <span className="rounded-2xl bg-orange-50 p-3 text-orange-600"><LayoutTemplate className="h-5 w-5" /></span>
      <div>
        <h2 className="text-lg font-black text-slate-950">เนื้อหาหน้าหลัก</h2>
        <p className="mt-1 text-sm text-slate-500">เลือกเนื้อหาที่ควรปรากฏบนหน้าร้าน โดยรูปแบบการแสดงผลควบคุมโดยแพลตฟอร์ม</p>
      </div>
    </div>
    <div className="mt-6 space-y-3">
      {sectionOptions.map(([type, label, description, Icon]) => {
        const section = sections.find((item) => item.type === type);
        const enabled = Boolean(section?.enabled);
        return (
          <button key={type} type="button" onClick={() => onToggle(type)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 px-4 py-4 text-left transition hover:border-orange-200 hover:bg-orange-50/40">
            <span className={`rounded-xl p-2.5 ${enabled ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-400'}`}><Icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-black text-slate-900">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
            </span>
            <span className={`relative h-6 w-11 rounded-full transition ${enabled ? 'bg-orange-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${enabled ? 'left-6' : 'left-1'}`} />
            </span>
          </button>
        );
      })}
    </div>
  </section>
);

export default StoreHomepageSectionsPanel;
