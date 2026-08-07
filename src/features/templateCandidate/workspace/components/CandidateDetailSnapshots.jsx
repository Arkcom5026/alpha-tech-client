const CandidateDetailSnapshots = ({ sourceSnapshot, proposedTemplateData }) => (
  <section className="grid gap-5 xl:grid-cols-2">
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-900">Source Snapshot</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">ข้อมูล Catalog ณ เวลาสร้าง Candidate</p>
      <pre className="mt-4 max-h-[440px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(sourceSnapshot || {}, null, 2)}
      </pre>
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-900">Proposed Template Data</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">ข้อมูลที่ใช้สร้าง Template ใหม่เมื่อ Promote</p>
      <pre className="mt-4 max-h-[440px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
        {JSON.stringify(proposedTemplateData || {}, null, 2)}
      </pre>
    </div>
  </section>
);

export default CandidateDetailSnapshots;
