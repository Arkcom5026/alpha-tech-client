import React from 'react';
import { CalendarRange } from 'lucide-react';

const TaxIntakePeriodFilterBar = ({
  taxPeriods,
  taxPeriodId,
  selectedTaxPeriod,
  loading,
  onChange,
}) => (
  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-white p-2 text-emerald-700 shadow-sm">
          <CalendarRange size={18} />
        </span>
        <div>
          <p className="text-sm font-black text-slate-900">กรองตามรอบภาษี</p>
          <p className="mt-0.5 text-xs text-slate-600">
            ระบบใช้วันเริ่มและวันสิ้นสุดของรอบภาษีเป็นเกณฑ์ ไม่อ้างอิงเลขเอกสาร
          </p>
        </div>
      </div>

      <div className="min-w-64">
        <label htmlFor="tax-intake-period-filter" className="mb-1 block text-xs font-bold text-slate-600">
          รอบภาษี
        </label>
        <select
          id="tax-intake-period-filter"
          value={taxPeriodId}
          disabled={loading}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 disabled:opacity-50"
        >
          <option value="">ทุกรอบภาษี</option>
          {taxPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.periodCode} · {period.status}
            </option>
          ))}
        </select>
      </div>
    </div>

    {taxPeriodId && (
      <div className="mt-3 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
        กำลังแสดงเฉพาะข้อมูลของรอบ {selectedTaxPeriod?.periodCode || taxPeriodId}
      </div>
    )}
  </div>
);

export default TaxIntakePeriodFilterBar;
