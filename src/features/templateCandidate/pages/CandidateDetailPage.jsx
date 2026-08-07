import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useTemplateCandidate from '../hooks/useTemplateCandidate';
import {
  TEMPLATE_CANDIDATE_STATUS,
  getCandidateStatusLabel,
} from '../utils/candidateStatus';
import CandidateDetailHeader from '../workspace/components/CandidateDetailHeader';
import CandidateDetailSnapshots from '../workspace/components/CandidateDetailSnapshots';
import CandidateDetailStartReview from '../workspace/components/CandidateDetailStartReview';
import CandidateDetailDecisionPanel from '../workspace/components/CandidateDetailDecisionPanel';
import CandidateDetailTimeline from '../workspace/components/CandidateDetailTimeline';

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
      <CandidateDetailHeader
        candidate={candidate}
        statusLabel={getCandidateStatusLabel(status)}
        onBack={() => navigate('..')}
      />

      {error && (
        <section role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error.message || String(error)}
        </section>
      )}

      <CandidateDetailSnapshots candidate={candidate} />

      <CandidateDetailStartReview
        visible={status === TEMPLATE_CANDIDATE_STATUS.DRAFT}
        busy={busy}
        onStart={() => runAction(() => startReview(id))}
      />

      <CandidateDetailDecisionPanel
        visible={status === TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW}
        busy={busy}
        decisionNote={decisionNote}
        setDecisionNote={setDecisionNote}
        targetTemplateProductId={targetTemplateProductId}
        setTargetTemplateProductId={setTargetTemplateProductId}
        promoteForm={promoteForm}
        setPromoteForm={setPromoteForm}
        onReject={() => runAction(() => rejectCandidate(id, { decisionNote: decisionNote.trim() }))}
        onMerge={() => runAction(() => mergeCandidate(id, {
          targetTemplateProductId: Number(targetTemplateProductId),
          decisionNote: decisionNote.trim() || null,
        }))}
        onPromote={handlePromote}
      />

      <CandidateDetailTimeline candidate={candidate} events={events} />
    </div>
  );
};

export default CandidateDetailPage;
