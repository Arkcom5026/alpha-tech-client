import React from 'react';
import { ArrowLeft, UserRound } from 'lucide-react';

const CustomerDetailWorkspace = ({ customerId, onBack }) => (
  <div className="min-h-full bg-slate-50 p-3 md:p-5">
    <div className="mx-auto max-w-6xl space-y-4">
      <header className="rounded-2xl border border-teal-100 bg-teal-50 p-4 md:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-teal-200 bg-white p-2.5 text-teal-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-teal-700">ข้อมูลลูกค้า</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">รายละเอียดลูกค้า</h1>
              <p className="mt-1 text-sm text-slate-600">รหัสลูกค้า {customerId || '-'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-800 hover:bg-teal-50"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับรายการลูกค้า
          </button>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-900">พื้นที่รายละเอียดลูกค้า</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          หน้านี้พร้อมรองรับข้อมูลทั่วไป เครดิต ลูกหนี้ เงินมัดจำ และประวัติเอกสาร เมื่อเชื่อมต่อแหล่งข้อมูลรายละเอียดลูกค้าแล้ว
        </p>
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <p className="font-medium text-slate-700">ยังไม่มีข้อมูลรายละเอียดที่เชื่อมต่อกับหน้านี้</p>
          <p className="mt-1 text-sm text-slate-500">ระบบจะไม่แสดงยอดหรือประวัติจำลองจนกว่าจะมี API ที่เป็นแหล่งข้อมูลจริง</p>
        </div>
      </section>
    </div>
  </div>
);

export default CustomerDetailWorkspace;
