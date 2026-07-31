import React from 'react';
import { FilePlus2 } from 'lucide-react';
import { formatTaxMoney } from '../utils/inputTaxReceiptLink';

const InputTaxDocumentSelectionPanel = ({
  eligibleDocuments,
  selectedDocumentId,
  selectedDocument,
  selectedDocumentMutable,
  selectedSupplierId,
  selectedReceiptCount,
  submitting,
  linksLoading,
  allocationOverflow,
  onDocumentChange,
  onToggleCreateDocument,
  onAttachSelected,
}) => (
  <>
    <div className="grid gap-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
      <label>
        <span className="mb-1 block text-xs font-bold text-slate-600">ใบกำกับภาษีซื้อที่จะผูก</span>
        <select
          value={selectedDocumentId}
          onChange={(event) => onDocumentChange(event.target.value)}
          className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">เลือกใบกำกับภาษี</option>
          {eligibleDocuments.map((document) => (
            <option key={document.id} value={document.id}>
              {document.documentNumber} · {formatTaxMoney(document.totalAmount)} · {document.status}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleCreateDocument}
          disabled={!selectedSupplierId}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 disabled:opacity-40"
        >
          <FilePlus2 size={17} /> สร้างใบกำกับภาษี
        </button>
        <button
          type="button"
          onClick={onAttachSelected}
          disabled={
            submitting
            || linksLoading
            || !selectedDocumentId
            || !selectedDocumentMutable
            || selectedReceiptCount === 0
            || allocationOverflow
          }
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40"
        >
          ผูก {selectedReceiptCount} ใบ
        </button>
      </div>
    </div>

    {selectedDocument && !selectedDocumentMutable && (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        เอกสารสถานะ {selectedDocument.status} เปิดดูประวัติการผูกได้ แต่ไม่สามารถเพิ่ม แก้ยอด หรือยกเลิกการผูกโดยตรง
      </div>
    )}
  </>
);

export default InputTaxDocumentSelectionPanel;
