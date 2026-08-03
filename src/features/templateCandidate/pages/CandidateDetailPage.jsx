import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTemplateCandidate from '../hooks/useTemplateCandidate';
import {
  TEMPLATE_CANDIDATE_STATUS,
  getCandidateStatusLabel,
} from '../utils/candidateStatus';

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const displayValue = (value) => {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const Field = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
    <p className="mt-1 whitespace-pre-wrap break-words text-sm font-bold text-slate-800">{displayValue(value)}</p>
  </div>
);

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedCandidate,
    loading,
    submitting,
    error,
    fetchById,
    startReview,
    rejectCandidate,
    mergeCandidate,
    promoteCandidate,
    clearError,
  } = useTemplateCandidate();

  const [decisionNote, setDecisionNote] = React.useState('');
  const [targetTemplateProductId, setTargetTemplateProductId] = React.useState('');
  const [promoteForm, setPromoteForm] = React.useState({
    name: '',
    productTypeId: '',
    brandId: '',
    unitId: '',
    mode: 'STRUCTURED',
    active: true,
    noSN: false,
    trackSerialNumber: false,
    codeType: '',
    warrantyDays: '',
    productConfig: '',
  });

  React.useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  React.useEffect(() => {
    const candidate = selectedCandidate;
    if (!candidate) return;
    const source = candidate.proposedTemplateData || candidate.sourceSnapshot || {};
    setDecisionNote(candidate.decisionNote || '');
    setTargetTemplateProductId(candidate.targetTemplateProductId || '');
    setPromoteForm((current) => ({
      ...current,
      name: source.name || candidate.sourceProductName || '',
      productTypeId: source.productTypeId || '',
      brandId: source.brandId || '',
      unitId: source.unitId || '',
      mode: source.mode || 'STRUCTURED',
      active: source.active ?? true,
      noSN: Boolean(source.noSN),
      trackSerialNumber: Boolean(source.trackSerialNumber),
      codeType: source.codeType || '',
      warrantyDays: source.warrantyDays || '',
      productConfig: source.productConfig ? JSON.stringify(source.productConfig, null, 2) : '',
    }));
  }, [selectedCandidate]);

  const refresh = React.useCallback(async () => {
    if (id) await fetchById(id);
  }, [fetchById, id]);

  const runAction = async (action) => {
    clearError();
    await action();
    await refresh();
  };

  const handlePromote = async () => {
    let productConfig = null;
    if (promoteForm.productConfig.trim()) {
      try {
        productConfig = JSON.parse(promoteForm.productConfig);
      } catch {
        throw new Error('Product Config ต้องเป็น JSON ที่ถูกต้อง');
      }
    }

    await runAction(() =>
      promoteCandidate(id, {
        name: promoteForm.name.trim(),
        productTypeId: Number(promoteForm.productTypeId),
        brandId: promoteForm.brandId ? Number(promoteForm.brandId) : null,
        unitId: promoteForm.unitId ? Number(promoteForm.unitId) : null,
        mode: promoteForm.mode,
        active: Boolean(promoteForm.active),
        noSN: Boolean(promoteForm.noSN),
        trackSerialNumber: Boolean(promoteForm.trackSerialNumber),
        codeType: promoteForm.codeType.trim() || null,
        warrantyDays: promoteForm.warrantyDays ? Number(promoteForm.warrantyDays) : null,
        productConfig,
        decisionNote: decisionNote.trim() || null,
      })
    );
  };

  const candidate = selectedCandidate;
  const status = candidate?.status;
  const busy = loading || submitting;
  const events = [...(candidate?.events || [])].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  if (loading && !candidate) {
    return <div className="p-6 text-sm font-bold text-slate-500">กำลังโหลด Candidate...</div>;
  }

  if (!candidate && error) {
    return <div className="p-6 text-sm font-bold text-red-600">{error.message || 'โหลดข้อมูลไม่สำเร็จ'}</div>;
  }

  if (!candidate) {
    return <div className="p-6 text-sm font-bold text-slate-500">ไม่พบ Candidate</div>;
  }

  return (
    <div className="min-h-screen space-y-5 bg-slate-50 p-4 xl:p-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => navigate('..')}
          className="text-xs font-black text-slate-500 hover:text-orange-600"
        >
          ← กลับ Review Queue
        </button>
        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Catalog Governance</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Candidate #{candidate.id}</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              ตรวจ Catalog-safe snapshot และประวัติการตัดสินใจก่อนเปลี่ยนสถานะ
            </p>
          </div>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">
            {getCandidateStatusLabel(status)}
          </div>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error.message || String(error)}
        </section>
      )}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Source Store" value={`${candidate.sourceBranchName || '-'} (#${candidate.sourceBranchId || '-'})`} />
        <Field label="Source Product" value={`${candidate.sourceProductName || '-'} (#${candidate.sourceProductId || '-'})`} />
        <Field label="Target Template Branch" value={`${candidate.targetTemplateBranchName || '-'} (#${candidate.targetTemplateBranchId || '-'})`} />
        <Field label="Target Template Product" value={`${candidate.targetTemplateProductName || '-'} (#${candidate.targetTemplateProductId || '-'})`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Source Snapshot</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">ข้อมูล Catalog ณ เวลาสร้าง Candidate</p>
          <pre className="mt-4 max-h-[440px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(candidate.sourceSnapshot || {}, null, 2)}
          </pre>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Proposed Template Data</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">ข้อมูลที่ใช้สร้าง Template ใหม่เมื่อ Promote</p>
          <pre className="mt-4 max-h-[440px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">
            {JSON.stringify(candidate.proposedTemplateData || {}, null, 2)}
          </pre>
        </div>
      </section>

      {status === TEMPLATE_CANDIDATE_STATUS.DRAFT && (
        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <h2 className="text-lg font-black text-blue-950">เริ่มตรวจสอบ Candidate</h2>
          <p className="mt-1 text-sm font-semibold text-blue-700">เปลี่ยนสถานะจาก DRAFT เป็น UNDER_REVIEW ก่อนตัดสินใจ</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction(() => startReview(id))}
            className="mt-4 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {busy ? 'กำลังดำเนินการ...' : 'Start Review'}
          </button>
        </section>
      )}

      {status === TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW && (
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-black text-slate-900">Review Decision</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">เลือกเพียงหนึ่ง terminal action: Reject, Merge หรือ Promote</p>
          </div>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Decision Note</span>
            <textarea
              value={decisionNote}
              maxLength={2000}
              onChange={(event) => setDecisionNote(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-orange-400"
              placeholder="เหตุผลหรือบันทึกประกอบการตัดสินใจ"
            />
          </label>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <h3 className="font-black text-red-900">Reject</h3>
              <p className="mt-1 text-xs font-semibold text-red-700">ต้องระบุเหตุผลก่อน Reject</p>
              <button
                type="button"
                disabled={busy || !decisionNote.trim()}
                onClick={() => runAction(() => rejectCandidate(id, { decisionNote: decisionNote.trim() }))}
                className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
              >Reject</button>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
              <h3 className="font-black text-purple-900">Merge Existing</h3>
              <input
                type="number"
                min="1"
                value={targetTemplateProductId}
                onChange={(event) => setTargetTemplateProductId(event.target.value)}
                placeholder="Target Template Product ID"
                className="mt-3 w-full rounded-xl border border-purple-200 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={busy || !targetTemplateProductId}
                onClick={() => runAction(() => mergeCandidate(id, {
                  targetTemplateProductId: Number(targetTemplateProductId),
                  decisionNote: decisionNote.trim() || null,
                }))}
                className="mt-4 rounded-xl bg-purple-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
              >Merge</button>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 xl:row-span-2">
              <h3 className="font-black text-emerald-900">Promote New Template</h3>
              <div className="mt-3 space-y-2">
                <input value={promoteForm.name} onChange={(e) => setPromoteForm({ ...promoteForm, name: e.target.value })} placeholder="Template name" className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
                <input type="number" min="1" value={promoteForm.productTypeId} onChange={(e) => setPromoteForm({ ...promoteForm, productTypeId: e.target.value })} placeholder="Product Type ID *" className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min="1" value={promoteForm.brandId} onChange={(e) => setPromoteForm({ ...promoteForm, brandId: e.target.value })} placeholder="Brand ID" className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
                  <input type="number" min="1" value={promoteForm.unitId} onChange={(e) => setPromoteForm({ ...promoteForm, unitId: e.target.value })} placeholder="Unit ID" className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
                </div>
                <select value={promoteForm.mode} onChange={(e) => setPromoteForm({ ...promoteForm, mode: e.target.value })} className="w-full rounded-xl border border-emerald-200 px-3 py-2 text-sm">
                  <option value="STRUCTURED">STRUCTURED</option>
                  <option value="SIMPLE">SIMPLE</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input value={promoteForm.codeType} onChange={(e) => setPromoteForm({ ...promoteForm, codeType: e.target.value })} placeholder="Code type" className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
                  <input type="number" min="1" value={promoteForm.warrantyDays} onChange={(e) => setPromoteForm({ ...promoteForm, warrantyDays: e.target.value })} placeholder="Warranty days" className="rounded-xl border border-emerald-200 px-3 py-2 text-sm" />
                </div>
                <textarea value={promoteForm.productConfig} onChange={(e) => setPromoteForm({ ...promoteForm, productConfig: e.target.value })} placeholder="Product Config JSON" className="min-h-24 w-full rounded-xl border border-emerald-200 px-3 py-2 font-mono text-xs" />
                <div className="flex flex-wrap gap-3 text-xs font-bold text-emerald-900">
                  <label><input type="checkbox" checked={promoteForm.active} onChange={(e) => setPromoteForm({ ...promoteForm, active: e.target.checked })} /> Active</label>
                  <label><input type="checkbox" checked={promoteForm.noSN} onChange={(e) => setPromoteForm({ ...promoteForm, noSN: e.target.checked })} /> No SN</label>
                  <label><input type="checkbox" checked={promoteForm.trackSerialNumber} onChange={(e) => setPromoteForm({ ...promoteForm, trackSerialNumber: e.target.checked })} /> Track Serial</label>
                </div>
              </div>
              <button
                type="button"
                disabled={busy || !promoteForm.name.trim() || !promoteForm.productTypeId}
                onClick={handlePromote}
                className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white disabled:opacity-40"
              >Promote</button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">Event Timeline</h2>
        <div className="mt-4 space-y-3">
          {events.length === 0 ? (
            <p className="text-sm font-semibold text-slate-500">ยังไม่มี Event</p>
          ) : events.map((event) => (
            <div key={event.id || `${event.eventType}-${event.createdAt}`} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-slate-900">{event.eventType || '-'}</p>
                <p className="text-xs font-bold text-slate-400">{formatDate(event.createdAt)}</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {event.previousStatus || '-'} → {event.resultingStatus || '-'} · Actor #{event.actorEmployeeId || '-'}
              </p>
              {event.note && <p className="mt-2 text-sm text-slate-700">{event.note}</p>}
              {event.metadata && (
                <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(event.metadata, null, 2)}</pre>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Field label="Created By" value={`${candidate.createdByEmployeeName || '-'} (#${candidate.createdByEmployeeId || '-'})`} />
        <Field label="Reviewed By" value={`${candidate.reviewedByEmployeeName || '-'} (#${candidate.reviewedByEmployeeId || '-'})`} />
        <Field label="Updated" value={formatDate(candidate.updatedAt)} />
      </section>
    </div>
  );
};

export default CandidateDetailPage;
