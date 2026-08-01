import coreSalesHelpContent from './coreSalesHelpContent';

const Checklist = ({ title, items }) => (
  <section>
    <h3 className="text-sm font-black text-slate-950">{title}</h3>
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700">
          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-black text-orange-700">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
);

const GuideRows = ({ title, rows }) => (
  <section>
    <h3 className="text-sm font-black text-slate-950">{title}</h3>
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
      {rows.map(([code, label, detail]) => (
        <div key={`${code}-${label}`} className="grid gap-1 border-b border-slate-200 bg-white px-4 py-3 last:border-b-0 sm:grid-cols-[150px_180px_1fr]">
          <code className="text-xs font-black text-orange-700">{code}</code>
          <strong className="text-sm text-slate-900">{label}</strong>
          <p className="text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      ))}
    </div>
  </section>
);

const CoreSalesHelpDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="คู่มือการขายสินค้า">
      <button
        type="button"
        aria-label="ปิดคู่มือการขายสินค้า"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-5xl flex-col bg-slate-100 shadow-2xl">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Alpha-Tech Sales Guide</p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{coreSalesHelpContent.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{coreSalesHelpContent.summary}</p>
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">{coreSalesHelpContent.scopeNote}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              aria-label="ปิดคู่มือการขายสินค้า"
            >
              ×
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <article className="mx-auto max-w-4xl space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <section>
              <h3 className="text-sm font-black text-slate-950">ลำดับการขาย</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                {coreSalesHelpContent.steps.map((item) => (
                  <li key={item} className="pl-1 text-sm leading-6 text-slate-700">{item}</li>
                ))}
              </ol>
            </section>

            <GuideRows title="รูปแบบรายการสินค้า" rows={coreSalesHelpContent.lineTypes} />
            <GuideRows title="รูปแบบการขาย" rows={coreSalesHelpContent.modes} />
            <Checklist title="ตรวจการชำระเงิน" items={coreSalesHelpContent.paymentChecklist} />
            <Checklist title="ตรวจใบพักรายการ" items={coreSalesHelpContent.heldCartChecklist} />
            <GuideRows title="สถานะหลังการขาย" rows={coreSalesHelpContent.statusGuide} />
            <GuideRows title="แนวทางแก้ปัญหา" rows={coreSalesHelpContent.recovery} />
            <Checklist title="ตรวจครั้งสุดท้ายก่อนจบงาน" items={coreSalesHelpContent.finalChecklist} />
          </article>
        </main>
      </aside>
    </div>
  );
};

export default CoreSalesHelpDrawer;
