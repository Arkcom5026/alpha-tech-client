import React from 'react';

const InputTaxReceiptFilters = ({ filters, suppliers, loading, onChange, onSearch, onReset }) => (
  <form
    className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6"
    onSubmit={(event) => { event.preventDefault(); onSearch(); }}
  >
    <label className="xl:col-span-2">
      <span className="mb-1 block text-xs font-bold text-slate-600">ค้นหา</span>
      <input
        value={filters.keyword}
        onChange={(event) => onChange('keyword', event.target.value)}
        placeholder="เลขใบส่งสินค้า / เลขใบรับ / ผู้จำหน่าย"
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
      />
    </label>
    <label>
      <span className="mb-1 block text-xs font-bold text-slate-600">ผู้จำหน่าย</span>
      <select value={filters.supplierId} onChange={(event) => onChange('supplierId', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <option value="">ผู้จำหน่ายทั้งหมด</option>
        {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
      </select>
    </label>
    <label>
      <span className="mb-1 block text-xs font-bold text-slate-600">แหล่งรับสินค้า</span>
      <select value={filters.sourceType} onChange={(event) => onChange('sourceType', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <option value="">ทั้งหมด</option>
        <option value="PO_RECEIPT">รับตามใบสั่งซื้อ (PO)</option>
        <option value="QUICK_RECEIPT">รับสินค้าแบบด่วน</option>
      </select>
    </label>
    <label>
      <span className="mb-1 block text-xs font-bold text-slate-600">สถานะการผูกเอกสาร</span>
      <select value={filters.linkState} onChange={(event) => onChange('linkState', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm">
        <option value="ACTION_REQUIRED">ต้องดำเนินการ</option>
        <option value="UNLINKED">ยังไม่ผูก</option>
        <option value="PARTIALLY_LINKED">ผูกบางส่วน</option>
        <option value="LINKED">ผูกครบแล้ว</option>
      </select>
    </label>
    <div className="flex items-end gap-2">
      <button type="submit" disabled={loading} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">ค้นหา</button>
      <button type="button" onClick={onReset} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-600">ล้างตัวกรอง</button>
    </div>
    <label>
      <span className="mb-1 block text-xs font-bold text-slate-600">ตั้งแต่วันที่</span>
      <input type="date" value={filters.fromDate} onChange={(event) => onChange('fromDate', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
    </label>
    <label>
      <span className="mb-1 block text-xs font-bold text-slate-600">ถึงวันที่</span>
      <input type="date" value={filters.toDate} onChange={(event) => onChange('toDate', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
    </label>
  </form>
);

export default InputTaxReceiptFilters;
