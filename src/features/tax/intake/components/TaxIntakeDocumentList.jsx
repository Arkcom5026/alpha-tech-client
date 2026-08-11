import React from 'react';
import {
  formatTaxIntakeMoney,
  getTaxIntakeBadgeClass,
} from '../presentation/taxIntakePresentation';

const TaxIntakeDocumentList = ({
  documents,
  loading,
  status,
  documentType,
  selectedDocumentId,
  onStatusChange,
  onDocumentTypeChange,
  onOpenDocument,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-4">
      <div>
        <h2 className="font-black text-slate-900">เอกสารภาษี</h2>
        <p className="text-xs text-slate-500">กรองสถานะและประเภทเอกสารภายในรอบภาษีที่เลือก</p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="กรองสถานะเอกสารภาษี"
        >
          <option value="">ทุกสถานะ</option>
          <option value="DRAFT">ฉบับร่าง (DRAFT)</option>
          <option value="REGISTERED">ลงทะเบียนแล้ว (REGISTERED)</option>
          <option value="UNDER_REVIEW">กำลังตรวจสอบ (UNDER_REVIEW)</option>
          <option value="APPROVED">อนุมัติแล้ว (APPROVED)</option>
          <option value="REJECTED">ไม่อนุมัติ (REJECTED)</option>
          <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
        </select>
        <select
          value={documentType}
          onChange={(event) => onDocumentTypeChange(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="กรองประเภทเอกสารภาษี"
        >
          <option value="">ทุกประเภทเอกสาร</option>
          <option value="OUTPUT_TAX_INVOICE">ใบกำกับภาษีขาย</option>
          <option value="INPUT_TAX_INVOICE">ใบกำกับภาษีซื้อ</option>
        </select>
      </div>
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
        <div className="p-8 text-center text-sm text-slate-500">ไม่พบเอกสารภาษีตามตัวกรองที่เลือก</div>
      )}
    </div>
  </div>
);

export default TaxIntakeDocumentList;
