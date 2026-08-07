import React from 'react';
import { Eye } from 'lucide-react';

const TaxPeriodCurrentPeriodCard = ({ currentPeriod, formatDate, formatDateTime, renderStatus, onOpen }) => {
  if (!currentPeriod) return null;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(currentPeriod.id)}
      className="block w-full rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left transition hover:border-blue-300 hover:bg-blue-100/70"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">รอบภาษีปัจจุบัน</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-black text-slate-900">{currentPeriod.periodCode}</h2>
            {renderStatus?.(currentPeriod.status)}
          </div>
          <p className="mt-1 text-sm text-slate-600">{formatDate?.(currentPeriod.startDate)} – {formatDate?.(currentPeriod.endDate)}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700"><Eye size={16} /> ดูรายละเอียด · อัปเดตล่าสุด {formatDateTime?.(currentPeriod.updatedAt)}</div>
      </div>
    </button>
  );
};

export default TaxPeriodCurrentPeriodCard;
