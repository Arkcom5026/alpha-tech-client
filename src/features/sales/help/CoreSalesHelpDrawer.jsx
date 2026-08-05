import { Check, X } from 'lucide-react';
import coreSalesHelpContent from './coreSalesHelpContent';

const Checklist = ({ title, items }) => (
  <section className="space-y-3">
    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-3 text-sm leading-6 text-slate-700"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <Check className="h-4 w-4" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
);

const GuideRows = ({ title, rows }) => (
  <section className="space-y-3">
    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {rows.map(([code, label, detail]) => (
        <div
          key={`${code}-${label}`}
          className="grid gap-2 border-b border-slate-200 px-4 py-4 last:border-b-0 sm:grid-cols-[150px_180px_1fr]"
        >
          <code className="w-fit rounded-lg bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800">
            {code}
          </code>
          <strong className="text-sm font-semibold text-slate-900">{label}</strong>
          <p className="text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      ))}
    </div>
  </section>
);

const CoreSalesHelpDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120]"
      role="dialog"
      aria-modal="true"
      aria-label="คู่มือการขายสินค้า"
    >
      <button
        type="button"
        aria-label="ปิดคู่มือการขายสินค้า"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full flex-col bg-slate-50 shadow-2xl sm:max-w-3xl lg:max-w-5xl">
        <header className="border-b border-teal-100 bg-teal-50 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-teal-700">คู่มือการขายสินค้า</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">
                {coreSalesHelpContent.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {coreSalesHelpContent.summary}
              </p>
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                {coreSalesHelpContent.scopeNote}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              aria-label="ปิดคู่มือการขายสินค้า"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          <article className="mx-auto max-w-4xl space-y-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 lg:p-7">
            <GuideRows title="การค้นหาและเลือกลูกค้า" rows={coreSalesHelpContent.customerSearch} />

            <section className="space-y-3">
              <h3 className="text-base font-semibold text-slate-950">ลำดับการขาย</h3>
              <ol className="space-y-2">
                {coreSalesHelpContent.steps.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-700"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 font-semibold text-teal-800">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
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
