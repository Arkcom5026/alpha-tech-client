import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const SOURCE_LABELS = {
  OUTPUT_VAT: 'ภาษีขาย',
  INPUT_VAT: 'ภาษีซื้อ',
  TAX_EXPENSE: 'ค่าใช้จ่าย',
  WITHHOLDING_TAX: 'ภาษีหัก ณ ที่จ่าย',
  TAX_PERIOD: 'รอบภาษี',
};

const AccountingOfficeExceptionsPanel = ({ exceptions = [] }) => {
  if (exceptions.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 size={18} />
          <h2 className="font-black">Exceptions = 0</h2>
        </div>
        <p className="mt-1 text-sm font-semibold text-emerald-700">ไม่พบรายการ blocker สำหรับชุดปิดภาษีรอบนี้</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-amber-900">
        <AlertTriangle size={18} />
        <h2 className="font-black">Exceptions / รายการที่ต้องแก้ก่อนส่งสำนักงานบัญชี</h2>
      </div>
      <div className="mt-3 grid gap-2">
        {exceptions.map((entry) => (
          <div key={entry.code} className="rounded-xl border border-amber-200 bg-white px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-amber-700">{SOURCE_LABELS[entry.source] || entry.source} · {entry.code}</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{entry.message}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">{entry.count || 1} รายการ</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AccountingOfficeExceptionsPanel;
