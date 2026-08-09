import React from 'react';
import {
  formatTaxIntakeMoney,
  getTaxIntakeBadgeClass,
} from '../presentation/taxIntakePresentation';

const TaxIntakeDocumentList = ({
  documents,
  loading,
  status,
  selectedDocumentId,
  onStatusChange,
  onOpenDocument,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
      <div>
        <h2 className="font-black text-slate-900">Tax Documents</h2>
        <p className="text-xs text-slate-500">เอกสารภาษีที่สร้างจาก Candidate</p>
      </div>
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">ทุกสถานะ</option>
        <option value="DRAFT">DRAFT</option>
        <option value="REGISTERED">REGISTERED</option>
        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>
    </div>

    <div className="divide-y divide-slate-100">
      {documents.map((item) => {
        const selected = String(item.id) === String(selectedDocumentId || '');
        return (
          <button
            type="button"
            key={item.id}
            aria-pressed={selected}
            onClick={() => onOpenDocument(item)}
            className={`block w-full p-4 text-left transition ${selected ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-900">{item.documentNumber}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.documentType} · {formatTaxIntakeMoney(item.totalAmount)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getTaxIntakeBadgeClass(item.status)}`}>
                {item.status}
              </span>
            </div>
          </button>
        );
      })}

      {!loading && documents.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">ยังไม่มี Tax Document</div>
      )}
    </div>
  </div>
);

export default TaxIntakeDocumentList;
