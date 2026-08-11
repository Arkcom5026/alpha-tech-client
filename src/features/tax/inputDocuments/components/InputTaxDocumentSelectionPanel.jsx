import React from 'react';
import { FilePlus2, Link2, CircleCheckBig } from 'lucide-react';
import { formatTaxMoney } from '../utils/inputTaxReceiptLink';

const InputTaxDocumentSelectionPanel = ({
  eligibleDocuments,
  selectedDocumentId,
  selectedDocument,
  selectedSupplierId,
  selectedReceiptCount,
  showCreateDocument,
  submitting,
  linksLoading,
  allocationOverflow,
  onDocumentChange,
  onToggleCreateDocument,
  onAttachSelected,
}) => {
  const hasReceipts = selectedReceiptCount > 0;
  const existingMode = hasReceipts && !showCreateDocument;

  return (
    <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">ขั้นตอนที่ 2 · เลือกวิธีจัดการใบกำกับภาษี</p>
        <p className="mt-1 text-sm text-slate-600">
          {hasReceipts
            ? `เลือกแล้ว ${selectedReceiptCount} ใบรับสินค้า จาก Supplier เดียวกัน จากนั้นเลือกเพียงหนึ่งวิธีด้านล่าง`
            : 'เลือกใบรับสินค้าที่ต้องการจัดการก่อน ระบบจึงจะแสดงทางเลือกที่เหมาะสม'}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onDocumentChange(selectedDocumentId || '')}
          disabled={!hasReceipts}
          className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
            existingMode ? 'border-blue-500 bg-white shadow-sm' : 'border-slate-200 bg-white/70'
          }`}
        >
          <div className="flex items-center gap-2 font-black text-slate-900"><Link2 size={18} /> ผูกกับใบกำกับภาษีที่มีอยู่</div>
          <p className="mt-1 text-xs text-slate-500">แสดงเฉพาะเอกสารของ Supplier เดียวกันที่ยังอยู่ในสถานะแก้ไข/ผูกเพิ่มได้</p>
        </button>

        <button
          type="button"
          onClick={onToggleCreateDocument}
          disabled={!hasReceipts || !selectedSupplierId}
          className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
            showCreateDocument ? 'border-emerald-500 bg-white shadow-sm' : 'border-slate-200 bg-white/70'
          }`}
        >
          <div className="flex items-center gap-2 font-black text-slate-900"><FilePlus2 size={18} /> สร้างใบกำกับภาษีใหม่</div>
          <p className="mt-1 text-xs text-slate-500">ระบบเติมยอดจากใบรับสินค้าที่เลือกให้ แล้วให้ตรวจตามเอกสารจริงก่อนยืนยัน</p>
        </button>
      </div>

      {existingMode && (
        <div className="grid gap-3 rounded-xl border border-blue-100 bg-white p-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label>
            <span className="mb-1 block text-xs font-bold text-slate-600">เลือกใบกำกับภาษีเดิม</span>
            <select
              value={selectedDocumentId}
              onChange={(event) => onDocumentChange(event.target.value)}
              disabled={!hasReceipts}
              className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm disabled:opacity-50"
            >
              <option value="">เลือกใบกำกับภาษีที่ยังผูกเพิ่มได้</option>
              {eligibleDocuments.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.documentNumber} · {formatTaxMoney(document.totalAmount)} · {document.status}
                </option>
              ))}
            </select>
            {eligibleDocuments.length === 0 && (
              <p className="mt-2 text-xs font-semibold text-amber-700">ไม่มีใบกำกับภาษีเดิมที่พร้อมให้ผูกเพิ่มสำหรับ Supplier นี้ ให้เลือก “สร้างใบกำกับภาษีใหม่”</p>
            )}
          </label>

          <button
            type="button"
            onClick={onAttachSelected}
            disabled={
              submitting
              || linksLoading
              || !selectedDocumentId
              || selectedReceiptCount === 0
              || allocationOverflow
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-40"
          >
            <CircleCheckBig size={17} /> ยืนยันผูก {selectedReceiptCount} ใบรับสินค้า
          </button>
        </div>
      )}

      {selectedDocument && allocationOverflow && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ยอดจากใบรับสินค้าที่เลือกเกินยอดคงเหลือของใบกำกับภาษีนี้ กรุณาเลือกเอกสารอื่นหรือปรับรายการก่อนยืนยัน
        </div>
      )}
    </div>
  );
};

export default InputTaxDocumentSelectionPanel;
