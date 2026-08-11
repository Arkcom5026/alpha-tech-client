import React from 'react';
import { CircleCheckBig } from 'lucide-react';

const amountFields = Object.freeze([
  ['subtotalAmount', 'มูลค่าก่อนภาษีมูลค่าเพิ่ม'],
  ['taxAmount', 'ภาษีมูลค่าเพิ่ม'],
  ['totalAmount', 'ยอดรวม'],
]);

const InputTaxDocumentCreationForm = ({
  supplierName,
  selectedReceiptCount = 0,
  invoice,
  submitting,
  onSubmit,
  onInvoiceChange,
}) => (
  <form
    onSubmit={onSubmit}
    className="grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5"
  >
    <div className="xl:col-span-5">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">ขั้นตอนที่ 3 · ตรวจสอบใบกำกับภาษีซื้อฉบับใหม่</p>
      <p className="mt-1 font-black text-slate-900">สร้างใบกำกับภาษีซื้อของ {supplierName}</p>
      <p className="text-xs text-slate-500">ระบบเติมยอดจากใบรับสินค้าที่เลือกให้ กรุณาตรวจเลขที่ วันที่ และยอดทั้งหมดกับใบกำกับภาษีจริงก่อนยืนยัน</p>
    </div>

    <label>
      <span className="mb-1 block text-xs font-bold">เลขที่ใบกำกับภาษี</span>
      <input
        required
        value={invoice.documentNumber}
        onChange={(event) => onInvoiceChange('documentNumber', event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
      />
    </label>

    <label>
      <span className="mb-1 block text-xs font-bold">วันที่ใบกำกับภาษี</span>
      <input
        required
        type="date"
        value={invoice.issuedAt}
        onChange={(event) => onInvoiceChange('issuedAt', event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"
      />
    </label>

    {amountFields.map(([field, label]) => (
      <label key={field}>
        <span className="mb-1 block text-xs font-bold">{label}</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={invoice[field]}
          onChange={(event) => onInvoiceChange(field, event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-right"
        />
      </label>
    ))}

    <div className="xl:col-span-5">
      <button
        type="submit"
        disabled={submitting || selectedReceiptCount === 0}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"
      >
        <CircleCheckBig size={17} /> สร้างใบกำกับภาษีซื้อและผูก {selectedReceiptCount} ใบรับสินค้า
      </button>
    </div>
  </form>
);

export default InputTaxDocumentCreationForm;
