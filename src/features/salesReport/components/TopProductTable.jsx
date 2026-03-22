

/* =========================
   TopProductTable.jsx
========================= */

import { Link } from 'react-router-dom';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const productTrendLabelMap = {
  UP: 'ดีขึ้น',
  DOWN: 'ลดลง',
  STABLE: 'คงที่',
};

const productTrendClassMap = {
  UP: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  DOWN: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  STABLE: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

export const TopProductTable = ({
    rows = [],
    title = 'สินค้าขายดี',
    subtitle,
    showStockLeft = true,
    showTrend = false,
    emptyMessage = 'ยังไม่มีข้อมูลสินค้าขายดีในช่วงเวลานี้',
    actionLabel = 'ดูทั้งหมด',
    actionTo = '/pos/reports/sales/products',
  }) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const resolvedSubtitle = subtitle || 'Top products จากจำนวนขายและมูลค่า';
  
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{resolvedSubtitle}</p>
          </div>
  
          {actionTo ? (
            <Link
              to={actionTo}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>
  
        {safeRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">สินค้า</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">จำนวนขาย</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">ยอดขาย</th>
                    {showStockLeft ? (
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">คงเหลือ</th>
                    ) : null}
                    {showTrend ? (
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">แนวโน้ม</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {safeRows.map((item, index) => (
                    <tr key={item.id || `${item.name}-${index}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-600">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.name || '-'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700">
                        {formatNumber(item.qty)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatCurrency(item.sales)}
                      </td>
                      {showStockLeft ? (
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatNumber(item.stockLeft)}
                        </td>
                      ) : null}
                      {showTrend ? (
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${productTrendClassMap[item.trend] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}
                          >
                            {productTrendLabelMap[item.trend] || item.trend || '-'}
                          </span>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    );
  };
  



