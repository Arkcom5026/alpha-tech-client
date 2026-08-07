const CanonicalGroupDetailSummary = ({ businessTypeLabel, templateBranch, categoryId, sourceProductCount, sourceBranchCount }) => (
  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
    {[
      ['Business Type', businessTypeLabel],
      ['Template Branch', templateBranch?.branchCode || '-'],
      ['Category ID', categoryId || templateBranch?.categoryId || '-'],
      ['Source Products', sourceProductCount],
      ['Source Stores', sourceBranchCount],
    ].map(([label, value]) => (
      <div key={label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
      </div>
    ))}
  </section>
);

export default CanonicalGroupDetailSummary;
