const CanonicalGroupMaterializationPanel = ({ canMaterialize, materializing, materializeError, materializeResult, onMaterialize }) => (
  <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">Candidate Materialization</p>
        <h2 className="mt-1 text-lg font-black text-slate-900">สร้าง Candidate สำหรับตรวจและสร้าง Product Template</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">ระบบจะสร้าง Candidate ผ่าน authority เดิมให้สินค้าต้นทางในกลุ่ม READY โดยไม่แก้สินค้า ราคา หรือสต๊อก</p>
      </div>
      <button type="button" disabled={!canMaterialize || materializing} onClick={onMaterialize} className="min-h-11 rounded-2xl bg-emerald-600 px-5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
        {materializing ? 'กำลังสร้าง Candidates...' : 'สร้าง Candidates จากกลุ่มนี้'}
      </button>
    </div>
    {!canMaterialize && <p className="mt-3 text-sm font-bold text-amber-800">กลุ่มนี้ต้องแก้ Product Type ให้เป็น READY ก่อนจึงจะสร้าง Candidate ได้</p>}
    {materializeError && <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{materializeError.message || String(materializeError)}</div>}
    {materializeResult && (
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-4"><p className="text-xs font-black text-slate-400">CREATED</p><p className="mt-1 text-2xl font-black text-emerald-700">{materializeResult.created?.length || 0}</p></div>
        <div className="rounded-2xl bg-white p-4"><p className="text-xs font-black text-slate-400">SKIPPED</p><p className="mt-1 text-2xl font-black text-amber-700">{materializeResult.skipped?.length || 0}</p></div>
        <div className="rounded-2xl bg-white p-4"><p className="text-xs font-black text-slate-400">FAILED</p><p className="mt-1 text-2xl font-black text-red-700">{materializeResult.failed?.length || 0}</p></div>
      </div>
    )}
  </section>
);

export default CanonicalGroupMaterializationPanel;
