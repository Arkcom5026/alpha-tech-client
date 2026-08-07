import React from 'react';
import { Eye } from 'lucide-react';

const TaxPeriodListTable = ({
  periods = [],
  visiblePeriods = [],
  loading = false,
  busyKey = '',
  renderStatus,
  actionMeta = {},
  formatDate,
  formatDateTime,
  filtersSlot = null,
  error = '',
  onOpen,
  onAction,
}) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="font-black text-slate-900">รายการรอบภาษี</h2>
        <p className="text-xs text-slate-500">แสดง {visiblePeriods.length} จาก {periods.length} รายการ</p>
      </div>
    </div>

    {filtersSlot}
    {error && <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">รอบภาษี</th>
            <th className="px-4 py-3">ช่วงวันที่</th>
            <th className="px-4 py-3">สถานะ</th>
            <th className="px-4 py-3">เหตุการณ์ล่าสุด</th>
            <th className="px-4 py-3 text-right">การทำงาน</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">กำลังโหลดรอบภาษี...</td></tr>
          ) : visiblePeriods.length === 0 ? (
            <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">ไม่พบรอบภาษีตามเงื่อนไขที่เลือก</td></tr>
          ) : visiblePeriods.map((period) => {
            const actions = Array.isArray(period.availableActions) ? period.availableActions : [];
            const latestEvent = period.submittedAt || period.lockedAt || period.reopenedAt || period.closedAt || period.updatedAt;
            return (
              <tr key={period.id} className="align-top hover:bg-slate-50/70">
                <td className="px-4 py-4"><div className="font-black text-slate-900">{period.periodCode}</div><div className="mt-1 text-xs text-slate-400">v{period.responseVersion || '1'}</div></td>
                <td className="px-4 py-4 text-slate-600">{formatDate?.(period.startDate)}<br />ถึง {formatDate?.(period.endDate)}</td>
                <td className="px-4 py-4">{renderStatus?.(period.status)}</td>
                <td className="px-4 py-4 text-slate-600">{formatDateTime?.(latestEvent)}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpen?.(period.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Eye size={14} /> รายละเอียด
                    </button>
                    {actions.length === 0 ? <span className="inline-flex items-center text-xs font-semibold text-slate-400">ไม่มี Action ต่อ</span> : actions.map(({ action }) => {
                      const meta = actionMeta[action];
                      if (!meta) return null;
                      const Icon = meta.icon;
                      const key = `${period.id}:${action}`;
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => onAction?.(period, action)}
                          disabled={!!busyKey}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                        >
                          <Icon size={14} /> {busyKey === key ? 'กำลังบันทึก...' : meta.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default TaxPeriodListTable;
