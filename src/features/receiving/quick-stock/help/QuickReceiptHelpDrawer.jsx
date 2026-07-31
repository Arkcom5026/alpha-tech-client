import quickReceiptHelpContent from './quickReceiptHelpContent';

const SectionList = ({ title, items, ordered = false }) => {
  if (!items?.length) return null;
  const Tag = ordered ? 'ol' : 'ul';

  return (
    <section>
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <Tag className={`mt-3 space-y-2 ${ordered ? 'list-decimal pl-5' : ''}`}>
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className={
              ordered
                ? 'pl-1 text-sm leading-6 text-slate-700'
                : 'flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700'
            }
          >
            {!ordered ? (
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-black text-indigo-700">
                ✓
              </span>
            ) : null}
            <span>{item}</span>
          </li>
        ))}
      </Tag>
    </section>
  );
};

const QuickReceiptHelpDrawer = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="คู่มือรับสินค้าด่วน">
      <button
        type="button"
        aria-label="ปิดคู่มือรับสินค้าด่วน"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-4xl flex-col bg-slate-100 shadow-2xl">
        <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">
                Alpha-Tech Receiving Guide
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">{quickReceiptHelpContent.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{quickReceiptHelpContent.summary}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              aria-label="ปิดคู่มือรับสินค้าด่วน"
            >
              ×
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <article className="mx-auto max-w-3xl space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <section>
              <h3 className="text-sm font-black text-slate-950">เลือกรูปแบบการรับสินค้า</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {quickReceiptHelpContent.modes.map((mode) => (
                  <div key={mode.code} className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                    <code className="text-xs font-black text-indigo-700">{mode.code}</code>
                    <h4 className="mt-2 text-sm font-black text-slate-950">{mode.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{mode.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <SectionList title="ลำดับการทำงาน" items={quickReceiptHelpContent.steps} ordered />
            <SectionList title="รายการที่ต้องตรวจ" items={quickReceiptHelpContent.checklist} />

            <section>
              <h3 className="text-sm font-black text-slate-950">ความหมายของสถานะ</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                {quickReceiptHelpContent.statuses.map(([code, label, action]) => (
                  <div
                    key={code}
                    className="grid gap-1 border-b border-slate-200 p-3 last:border-b-0 sm:grid-cols-[120px_180px_minmax(0,1fr)]"
                  >
                    <code className="text-xs font-black text-indigo-700">{code}</code>
                    <span className="text-sm font-black text-slate-900">{label}</span>
                    <span className="text-sm leading-6 text-slate-600">{action}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black text-slate-950">คำถามและแนวทางแก้ปัญหา</h3>
              <div className="mt-3 space-y-3">
                {quickReceiptHelpContent.faq.map(([question, answer]) => (
                  <details key={question} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                      {question}
                    </summary>
                    <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-black text-amber-950">ข้อควรรู้</h3>
              <ul className="mt-2 space-y-2">
                {quickReceiptHelpContent.notes.map((note) => (
                  <li key={note} className="flex gap-2 text-sm leading-6 text-amber-900">
                    <span aria-hidden="true">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </section>
          </article>
        </main>
      </aside>
    </div>
  );
};

export default QuickReceiptHelpDrawer;
