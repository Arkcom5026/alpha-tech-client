const CandidateReviewWorkspaceHeader = ({ loading, hasBusinessType, onRefresh }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
      Template Catalog Quality
    </p>
    <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Product Template Candidate Workspace</h1>
        <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
          ตรวจสินค้าต้นแบบที่อาจซ้ำ ข้อมูลที่ควรปรับปรุง และสินค้าที่ไม่มีร้านอ้างอิง โดยแยก Catalog ตามประเภทธุรกิจ
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={!hasBusinessType || loading}
        className="min-h-11 rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
      >
        {loading ? 'กำลังโหลด...' : 'Refresh Queue'}
      </button>
    </div>
  </section>
);

export default CandidateReviewWorkspaceHeader;
