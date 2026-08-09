import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DeliveryCreditSettlementListPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 md:p-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-800"><FileText className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">ประวัติการตัดยอดใบส่งของเครดิต</h1>
            <p className="text-sm text-slate-500">เอกสารการนำ Customer Money ไปตัดยอดใบส่งของเครดิต โดยไม่กระทบสต๊อก</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('./create')} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800">
          <Plus className="h-4 w-4" /> ตัดยอดใบส่งของ
        </button>
      </header>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <div className="font-semibold text-slate-900">Settlement History Workspace</div>
        <p className="mt-2 text-sm text-slate-500">รายการย้อนหลังจะเปิดใช้งานพร้อม settlement persistence ในขั้นยืนยันตัดยอด</p>
      </section>
    </div>
  );
};

export default DeliveryCreditSettlementListPage;
