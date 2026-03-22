



/* =========================
   ProductPerformancePage.jsx
========================= */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSalesReportStore from '@/features/salesReport/stores/salesReportStore';

// helpers (scoped)
const KPI_CARD_CLASS =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const ProductPerformancePage = () => {
  const filters = useSalesReportStore((s) => s.filters);
  const productPerformance = useSalesReportStore((s) => s.productPerformance);
  const loading = useSalesReportStore((s) => s.productPerformanceLoading);
  const error = useSalesReportStore((s) => s.productPerformanceError);
  const fetchProductPerformanceAction = useSalesReportStore((s) => s.fetchProductPerformanceAction);
  const setFiltersAction = useSalesReportStore((s) => s.setFiltersAction);
  const resetFiltersAction = useSalesReportStore((s) => s.resetFiltersAction);

  useEffect(() => {
    fetchProductPerformanceAction();
  }, [fetchProductPerformanceAction]);

  const handleDateChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleApplyDateFilter = () => {
    fetchProductPerformanceAction({
      dateFrom: filters?.dateFrom || '',
      dateTo: filters?.dateTo || '',
      page: 1,
    });
  };

  const handleResetDateFilter = () => {
    resetFiltersAction();
    fetchProductPerformanceAction({
      dateFrom: '',
      dateTo: '',
      page: 1,
    });
  };

  const summary = productPerformance?.summary || {
    totalProductsSold: 0,
    totalUnitsSold: 0,
    totalSalesValue: 0,
    lowStockHotProducts: 0,
  };

  const topByRevenue = productPerformance?.topByRevenue || [];
  const slowMoving = productPerformance?.slowMoving || [];
  const lowStockBestSellers = productPerformance?.lowStockBestSellers || [];

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Sales Report</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                วิเคราะห์ประสิทธิภาพสินค้า
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                กรองช่วงวันที่จริงเพื่อดูสินค้าทำรายได้สูง สินค้าเสี่ยง และสินค้าขายช้าในช่วงเวลาที่ต้องการ
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pos/reports/sales"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                กลับ Dashboard
              </Link>
              <Link
                to="/pos/reports/sales/list"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                ดูรายการขาย
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_160px_160px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={filters?.dateFrom || ''}
                onChange={(event) => handleDateChange('dateFrom', event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={filters?.dateTo || ''}
                onChange={(event) => handleDateChange('dateTo', event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleApplyDateFilter}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                ใช้ตัวกรอง
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetDateFilter}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ล้างช่วงวันที่
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className={KPI_CARD_CLASS}>
            <p className="text-sm text-slate-500">จำนวนสินค้าที่ขายได้</p>
            <h2 className="mt-2 text-2xl font-bold">{formatNumber(summary.totalProductsSold)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm text-slate-500">จำนวนชิ้นรวม</p>
            <h2 className="mt-2 text-2xl font-bold">{formatNumber(summary.totalUnitsSold)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm text-slate-500">มูลค่าขายรวมสินค้า</p>
            <h2 className="mt-2 text-2xl font-bold">{formatCurrency(summary.totalSalesValue)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm text-slate-500">ขายดีแต่สต๊อกต่ำ</p>
            <h2 className="mt-2 text-2xl font-bold">{formatNumber(summary.lowStockHotProducts)}</h2>
          </article>
        </section>

        {loading ? (
          <div className="rounded-2xl bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <>
            {/* Top Products */}
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">สินค้าทำรายได้สูง</h3>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th>#</th>
                    <th>สินค้า</th>
                    <th className="text-right">ขายได้</th>
                    <th className="text-right">ยอดขาย</th>
                  </tr>
                </thead>
                <tbody>
                  {topByRevenue.length > 0 ? (
                    topByRevenue.map((item, i) => (
                      <tr key={item.id} className="border-b">
                        <td>{i + 1}</td>
                        <td>{item.name}</td>
                        <td className="text-right">{formatNumber(item.qty)}</td>
                        <td className="text-right">{formatCurrency(item.sales)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-slate-500">
                        ไม่มีข้อมูล
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* Low stock */}
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">สินค้าเสี่ยง</h3>

              {lowStockBestSellers.length > 0 ? (
                lowStockBestSellers.map((item) => (
                  <div key={item.id} className="mb-3 border rounded-xl p-3">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-slate-600">คงเหลือ {item.stockLeft}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">ไม่มีข้อมูล</div>
              )}
            </section>

            {/* Slow moving */}
            <section className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">สินค้าขายช้า</h3>

              {slowMoving.length > 0 ? (
                slowMoving.map((item) => (
                  <div key={item.id} className="mb-3 border rounded-xl p-3">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-sm text-slate-600">
                      ไม่ขายมา {formatNumber(item.daysWithoutSale)} วัน
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">ไม่มีข้อมูล</div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPerformancePage;
