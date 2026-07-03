// src/features/product/templateCandidate/components/CandidateSubmitNotice.jsx
import React from 'react';
import CandidateBadge from './CandidateBadge';

const CandidateSubmitNotice = ({ candidate, visible = true }) => {
  if (!visible) return null;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold">สร้างสินค้า Local เรียบร้อยแล้ว</div>
        {candidate?.status && <CandidateBadge status={candidate.status} />}
      </div>
      <p>
        สินค้านี้พร้อมใช้งานในร้านและรับสินค้าได้ทันที ระบบส่งข้อมูลให้ผู้ดูแล Catalog ตรวจสอบภายหลัง
      </p>
      {candidate?.id && (
        <p className="text-xs text-blue-700">
          Candidate ID: {candidate.id}
        </p>
      )}
    </div>
  );
};

export default CandidateSubmitNotice;
