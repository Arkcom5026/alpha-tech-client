// src/features/product/templateCandidate/pages/CandidateDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useTemplateCandidate from '../hooks/useTemplateCandidate';
import CandidateStatus from '../components/CandidateStatus';
import CandidateReviewCard from '../components/CandidateReviewCard';

const CandidateDetailPage = () => {
  const { id } = useParams();
  const {
    selectedCandidate,
    loading,
    error,
    fetchById,
    promoteCandidate,
    rejectCandidate,
    requestRevision,
  } = useTemplateCandidate();

  useEffect(() => {
    if (id) fetchById(id);
  }, [id, fetchById]);

  const candidate = selectedCandidate;

  if (loading && !candidate) {
    return <div className="p-6 text-slate-500">กำลังโหลด Candidate...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error.message || 'โหลดข้อมูลไม่สำเร็จ'}</div>;
  }

  if (!candidate) {
    return <div className="p-6 text-slate-500">ไม่พบ Candidate</div>;
  }

  return (
    <div className="p-4 xl:p-6 space-y-4 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Candidate Detail</h1>
        <p className="text-sm text-slate-500">
          ตรวจข้อมูลที่เสนอจาก Local Operational Product ก่อน Promote เป็น Template Catalog
        </p>
      </div>

      <CandidateStatus candidate={candidate} />

      <CandidateReviewCard
        candidate={candidate}
        onPromote={(item) => promoteCandidate(item.id)}
        onReject={(item) => {
          const adminNote = window.prompt('เหตุผลที่ Reject') || '';
          return rejectCandidate(item.id, { adminNote });
        }}
        onRequestRevision={(item) => {
          const adminNote = window.prompt('ข้อมูลที่ต้องการให้แก้ไข') || '';
          return requestRevision(item.id, { adminNote });
        }}
      />

      <section className="rounded-2xl border bg-white p-4 space-y-2">
        <h2 className="font-semibold text-slate-900">ข้อมูลจากร้าน</h2>
        <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-50">
          {JSON.stringify(candidate, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default CandidateDetailPage;
