import React from 'react';
import { Link2, RefreshCw } from 'lucide-react';

const InputTaxReceiptWorkspaceHeader = ({ loading, onRefresh }) => (
  <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
    <div>
      <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
        <Link2 size={18} /> การเชื่อมโยงเอกสารภาษีซื้อ
      </div>
      <h1 className="mt-1 text-2xl font-black text-slate-900">ติดตามและผูกใบรับสินค้ากับใบกำกับภาษีซื้อ</h1>
      <p className="mt-1 text-sm text-slate-500">
        เลือกใบรับสินค้าที่เกี่ยวข้อง แล้วผูกกับใบกำกับภาษีซื้อเดิมหรือสร้างใบใหม่ตามเอกสารจริง
      </p>
    </div>

    <button
      type="button"
      onClick={onRefresh}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"
    >
      <RefreshCw size={17} className={loading ? 'animate-spin' : ''} /> โหลดข้อมูลใหม่
    </button>
  </header>
);

export default InputTaxReceiptWorkspaceHeader;
