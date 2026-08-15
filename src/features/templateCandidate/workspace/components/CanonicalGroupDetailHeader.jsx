const CanonicalGroupDetailHeader = ({ group, groupKey, statusLabel, statusClass, onBack }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <button type="button" onClick={onBack} className="min-h-11 rounded-2xl border border-slate-200 px-4 text-sm font-black text-slate-700">← กลับไปหน้ากลุ่ม</button>
    <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Product Template · Canonical Group Detail</p>
    <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-black text-slate-900">{group.canonicalName || '-'}</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">มุมมองแบบอ่านอย่างเดียวสำหรับตรวจ Canonical Group ก่อนสร้าง Candidate</p>
        <p className="mt-2 text-sm font-bold text-slate-500">{group.canonicalBrandName || group.brandName || 'ไม่ระบุแบรนด์'}</p>
        <p className="mt-2 break-all font-mono text-xs text-slate-400">{group.groupKey || group.groupFingerprint || groupKey}</p>
      </div>
      <span className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${statusClass(group.reviewStatus)}`}>{statusLabel(group.reviewStatus)}</span>
    </div>
  </section>
);

export default CanonicalGroupDetailHeader;
