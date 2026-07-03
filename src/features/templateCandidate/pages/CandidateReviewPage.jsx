// src/features/product/templateCandidate/pages/CandidateReviewPage.jsx
import React, { useEffect, useState } from 'react';
import useTemplateCandidate from '../hooks/useTemplateCandidate';
import CandidateReviewCard from '../components/CandidateReviewCard';
import { TEMPLATE_CANDIDATE_STATUS } from '../utils/candidateStatus';

const CandidateReviewPage = () => {
  const [status, setStatus] = useState(TEMPLATE_CANDIDATE_STATUS.SUBMITTED);
  const {
    candidates,
    loading,
    error,
    refresh,
    promoteCandidate,
    rejectCandidate,
    requestRevision,
  } = useTemplateCandidate();

  useEffect(() => {
    refresh({ status });
  }, [refresh, status]);

  const handlePromote = async (candidate) => {
    await promoteCandidate(candidate.id);
    refresh({ status });
  };

  const handleReject = async (candidate) => {
    const adminNote = window.prompt('เหตุผลที่ Reject') || '';
    await rejectCandidate(candidate.id, { adminNote });
    refresh({ status });
  };

  const handleRequestRevision = async (candidate) => {
    const adminNote = window.prompt('ข้อมูลที่ต้องการให้แก้ไข') || '';
    await requestRevision(candidate.id, { adminNote });
    refresh({ status });
  };

  return (
    <div className="p-4 xl:p-6 space-y-4 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Product Template Candidate Review</h1>
          <p className="text-sm text-slate-500">
            ตรวจรายการสินค้าที่ร้านสร้างขึ้นจริง แล้วพิจารณา Promote เป็น Template กลาง
          </p>
        </div>

        <select
          className="rounded-lg border bg-white px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {Object.values(TEMPLATE_CANDIDATE_STATUS).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.message || 'โหลดข้อมูลไม่สำเร็จ'}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-center text-slate-500">
          กำลังโหลด Candidate...
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center text-slate-500">
          ยังไม่มี Candidate ในสถานะนี้
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {candidates.map((candidate) => (
            <CandidateReviewCard
              key={candidate.id}
              candidate={candidate}
              onPromote={handlePromote}
              onReject={handleReject}
              onRequestRevision={handleRequestRevision}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateReviewPage;
