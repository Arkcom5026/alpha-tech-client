const Field = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    <p className="mt-1 whitespace-pre-wrap break-words text-sm font-bold text-slate-800">{value || '-'}</p>
  </div>
);

const CandidateDetailHeader = ({ candidate, statusLabel, onBack }) => (
  <>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <button type="button" onClick={onBack} className="min-h-11 rounded-2xl border border-slate-200 px-4 text-xs font-black text-slate-600 hover:border-orange-300 hover:text-orange-600">
        ← กลับ Review Queue
      </button>
      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Catalog Governance</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Candidate #{candidate.id}</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">ตรวจ Catalog-safe snapshot และประวัติการตัดสินใจก่อนเปลี่ยนสถานะ</p>
        </div>
        <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">{statusLabel}</div>
      </div>
    </section>

    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Field label="Source Store" value={`${candidate.sourceBranchName || '-'} (#${candidate.sourceBranchId || '-'})`} />
      <Field label="Source Product" value={`${candidate.sourceProductName || '-'} (#${candidate.sourceProductId || '-'})`} />
      <Field label="Target Template Branch" value={`${candidate.targetTemplateBranchName || '-'} (#${candidate.targetTemplateBranchId || '-'})`} />
      <Field label="Target Template Product" value={`${candidate.targetTemplateProductName || '-'} (#${candidate.targetTemplateProductId || '-'})`} />
    </section>
  </>
);

export default CandidateDetailHeader;
