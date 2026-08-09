import React from 'react';

const amountFields = Object.freeze([
  ['subtotalAmount', 'มูลค่าก่อน VAT'],
  ['taxAmount', 'VAT'],
  ['totalAmount', 'ยอดรวม'],
]);

const InputTaxDocumentCreationForm = ({
  supplierName,
  invoice,
  submitting,
  onSubmit,
  onInvoiceChange,
}) => (
  <form
    onSubmit={onSubmit}
    className="grid gap-3 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5"
  >
    <div className="xl:col-span-5">
      <p className="font-black text-slate-900">สร้างใบกำกับภาษีซื้อของ {supplierName}</p>
      <p className="text-xs text-slate-500">ยอดถูกเติมจากใบรับสินค้าที่เลือก และยังแก้ไขได้ตามใบกำกับจริง ก่อนบันทึกและผูกอัตโนมัติ</p>
    </div>

    <label>
      <span className="mb-1 block text-xs font-bold">เลขที่ใบกำกับภาษี</span>
      <input
        required
        value={invoice.documentNumber}
        onChange={(event) => onInvoiceChange('documentNumber', event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
      />
    </label>

    <label>
      <span className="mb-1 block text-xs font-bold">วันที่ใบกำกับภาษี</span>
      <input
        required
        type="date"
        value={invoice.issuedAt}
        onChange={(event) => onInvoiceChange('issuedAt', event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
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
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-right"
        />
      </label>
    ))}

    <div className="xl:col-span-5">
      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"
      >
        บันทึกและผูกใบกำกับภาษีซื้อ
      </button>
    </div>
  </form>
);

export default InputTaxDocumentCreationForm;
