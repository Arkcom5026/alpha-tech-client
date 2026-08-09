import { SALE_RETURN_HELP_QUICK_CHECKLIST, SALE_RETURN_HELP_SECTIONS } from './saleReturnHelpContent';

const SaleReturnHelpDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" role="dialog" aria-modal="true" aria-label="คู่มือคืนสินค้า">
      <button
        type="button"
        className="min-w-0 flex-1 cursor-default"
        aria-label="ปิดคู่มือคืนสินค้า"
        onClick={onClose}
      />
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Sale Return Help</p>
            <h2 className="text-xl font-black text-slate-900">คู่มือคืนสินค้าและคืนเงิน</h2>
            <p className="mt-1 text-sm text-slate-500">อ้างอิงจาก Runtime authority ของโมดูล Sale Return ปัจจุบัน</p>
          </div>
          <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-100" onClick={onClose}>
            ปิด
          </button>
        </header>

        <div className="space-y-5 p-5">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <h3 className="font-black text-emerald-900">ตรวจด่วนก่อนยืนยัน</h3>
            <ul className="mt-3 space-y-2 text-sm text-emerald-950">
              {SALE_RETURN_HELP_QUICK_CHECKLIST.map((item) => (
                <li key={item} className="flex gap-2"><span className="font-black text-emerald-600">✓</span><span>{item}</span></li>
              ))}
            </ul>
          </section>

          {SALE_RETURN_HELP_SECTIONS.map((section) => (
            <section key={section.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-black text-slate-900">{section.title}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-600">{section.summary}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2"><span className="text-emerald-500">•</span><span>{item}</span></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default SaleReturnHelpDrawer;
