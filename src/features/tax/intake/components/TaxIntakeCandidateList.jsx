import React from 'react';
import {
  formatTaxIntakeDateTime,
  getTaxIntakeBadgeClass,
} from '../presentation/taxIntakePresentation';

const TaxIntakeCandidateList = ({
  candidates,
  loading,
  status,
  onStatusChange,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
      <div>
        <h2 className="font-black text-slate-900">Candidates</h2>
        <p className="text-xs text-slate-500">เอกสารธุรกิจที่เข้าสู่ระบบภาษี</p>
      </div>
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">ทุกสถานะ</option>
        <option value="REGISTERED">REGISTERED</option>
        <option value="MAPPED">MAPPED</option>
        <option value="CONVERTED">CONVERTED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
    </div>

    <div className="divide-y divide-slate-100">
      {candidates.map((item) => (
        <div key={item.id} className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">
                {item.sourceDocumentNo || `${item.sourceType}-${item.sourceId}`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {item.sourceType} · {formatTaxIntakeDateTime(item.occurredAt)}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getTaxIntakeBadgeClass(item.status)}`}>
              {item.status}
            </span>
          </div>
        </div>
      ))}

      {!loading && candidates.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">ยังไม่มี Candidate</div>
      )}
    </div>
  </div>
);

export default TaxIntakeCandidateList;
