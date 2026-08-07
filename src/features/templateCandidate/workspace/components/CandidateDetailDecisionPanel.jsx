const CandidateDetailDecisionPanel = ({ visible, busy, decisionNote, setDecisionNote, targetTemplateProductId, setTargetTemplateProductId, promoteForm, setPromoteForm, onReject, onMerge, onPromote }) => {
  if (!visible) return null;
  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div><h2 className="text-lg font-black text-slate-900">Review Decision</h2><p className="mt-1 text-sm font-semibold text-slate-500">เลือกเพียงหนึ่ง terminal action: Reject, Merge หรือ Promote</p></div>
      <label className="block"><span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Decision Note</span><textarea value={decisionNote} maxLength={2000} onChange={(event) => setDecisionNote(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-3 text-sm" placeholder="เหตุผลหรือบันทึกประกอบการตัดสินใจ" /></label>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4"><h3 className="font-black text-red-900">Reject</h3><button type="button" disabled={busy || !decisionNote.trim()} onClick={onReject} className="mt-4 min-h-11 rounded-xl bg-red-700 px-4 text-sm font-black text-white disabled:opacity-40">Reject</button></div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4"><h3 className="font-black text-purple-900">Merge Existing</h3><input type="number" min="1" value={targetTemplateProductId} onChange={(event) => setTargetTemplateProductId(event.target.value)} placeholder="Target Template Product ID" className="mt-3 min-h-11 w-full rounded-xl border border-purple-200 px-3 text-sm" /><button type="button" disabled={busy || !targetTemplateProductId} onClick={onMerge} className="mt-4 min-h-11 rounded-xl bg-purple-700 px-4 text-sm font-black text-white disabled:opacity-40">Merge</button></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 xl:row-span-2"><h3 className="font-black text-emerald-900">Promote New Template</h3><div className="mt-3 space-y-2">
          <input value={promoteForm.name} onChange={(e) => setPromoteForm({ ...promoteForm, name: e.target.value })} placeholder="Template name" className="min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm" />
          <input type="number" min="1" value={promoteForm.productTypeId} onChange={(e) => setPromoteForm({ ...promoteForm, productTypeId: e.target.value })} placeholder="Product Type ID *" className="min-h-11 w-full rounded-xl border border-emerald-200 px-3 text-sm" />
          <textarea value={promoteForm.productConfig} onChange={(e) => setPromoteForm({ ...promoteForm, productConfig: e.target.value })} placeholder="Product Config JSON" className="min-h-24 w-full rounded-xl border border-emerald-200 px-3 py-2 font-mono text-xs" />
          <label className="block text-xs font-bold"><input type="checkbox" checked={promoteForm.trackSerialNumber} onChange={(e) => setPromoteForm({ ...promoteForm, trackSerialNumber: e.target.checked })} /> Track Serial</label>
        </div><button type="button" disabled={busy || !promoteForm.name.trim() || !promoteForm.productTypeId} onClick={onPromote} className="mt-4 min-h-11 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white disabled:opacity-40">Promote</button></div>
      </div>
    </section>
  );
};

export default CandidateDetailDecisionPanel;
