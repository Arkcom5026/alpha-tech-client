

// src/features/salesReport/pages/SalesDashboardPage.jsx

import React, { useEffect } from 'react';
import useSalesReportStore from '@/features/salesReport/stores/salesReportStore';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Receipt,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const KPI_CARD_CLASS =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md';

const SalesDashboardPage = () => {
  const filters = useSalesReportStore((state) => state.filters);
  const dashboard = useSalesReportStore((state) => state.dashboard);
  const dashboardLoading = useSalesReportStore((state) => state.dashboardLoading);
  const dashboardError = useSalesReportStore((state) => state.dashboardError);
  const fetchDashboardAction = useSalesReportStore((state) => state.fetchDashboardAction);
  const setFiltersAction = useSalesReportStore((state) => state.setFiltersAction);
  const resetFiltersAction = useSalesReportStore((state) => state.resetFiltersAction);

  const summary = dashboard?.summary || {
    totalSales: 0,
    totalBills: 0,
    avgPerBill: 0,
    totalUnits: 0,
    pendingOrders: 0,
    growthPct: 0,
  };
  const dailySales = Array.isArray(dashboard?.dailySales) ? dashboard.dailySales : [];
  const topProducts = Array.isArray(dashboard?.topProducts) ? dashboard.topProducts : [];
  const risks = Array.isArray(dashboard?.risks) ? dashboard.risks : [];

  useEffect(() => {
    fetchDashboardAction();
  }, [fetchDashboardAction]);

  const handleDateChange = (key, value) => {
    setFiltersAction({ [key]: value });
  };

  const handleApplyDateFilter = () => {
    fetchDashboardAction({
      dateFrom: filters?.dateFrom || '',
      dateTo: filters?.dateTo || '',
      page: 1,
    });
  };

  const handleResetDateFilter = () => {
    resetFiltersAction();
    fetchDashboardAction({
      dateFrom: '',
      dateTo: '',
      page: 1,
    });
  };

  const maxDailyAmount = Math.max(...dailySales.map((item) => Number(item?.amount || 0)), 1);
  const hasDailySales = dailySales.length > 0;
  const hasTopProducts = topProducts.length > 0;
  const hasRisks = risks.length > 0;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Sales Report</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Dashboard รายงานการขาย
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              ภาพรวมยอดขาย, จำนวนบิล, สินค้าขายดี และสัญญาณที่ควรติดตามของสาขา
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/pos/reports/sales/list"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ดูรายการขาย
            </Link>
            <Link
              to="/pos/reports/sales/products"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              วิเคราะห์สินค้า
            </Link>
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

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article className={KPI_CARD_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">ยอดขายรวม</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(summary.totalSales)}
                </h2>
                <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
                  <TrendingUp size={16} /> {summary.growthPct >= 0 ? '+' : ''}
                  {formatNumber(summary.growthPct)}% จากช่วงก่อนหน้า
                </p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <DollarSign size={28} />
              </div>
            </div>
          </article>

          <article className={KPI_CARD_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">จำนวนบิล</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(summary.totalBills)}</h2>
                <p className="mt-2 text-sm text-slate-500">จำนวนรายการขายทั้งหมดในช่วงที่เลือก</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <Receipt size={28} />
              </div>
            </div>
          </article>

          <article className={KPI_CARD_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">ค่าเฉลี่ยต่อบิล</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(summary.avgPerBill)}
                </h2>
                <p className="mt-2 text-sm text-slate-500">ช่วยดูคุณภาพยอดขายต่อธุรกรรม</p>
              </div>
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <ShoppingCart size={28} />
              </div>
            </div>
          </article>

          <article className={KPI_CARD_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">จำนวนชิ้นที่ขาย</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(summary.totalUnits)}</h2>
                <p className="mt-2 text-sm text-slate-500">รวมจำนวนสินค้าที่ถูกขายออกทั้งหมด</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <Package size={28} />
              </div>
            </div>
          </article>

          <article className={KPI_CARD_CLASS}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">ใบสั่งซื้อค้างรับ</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(summary.pendingOrders)}</h2>
                <p className="mt-2 text-sm text-slate-500">ใช้เชื่อมการตัดสินใจระหว่างยอดขายกับการจัดซื้อ</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
                <AlertTriangle size={28} />
              </div>
            </div>
          </article>

          <article className={`${KPI_CARD_CLASS} bg-gradient-to-br from-slate-900 to-slate-800 text-white`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-300">สถานะภาพรวม</p>
                <h2 className="mt-2 text-2xl font-bold">สาขากำลังขายได้ดี</h2>
                <p className="mt-2 text-sm text-slate-300">
                  มีแนวโน้มเติบโต และควรติดตามสินค้าขายดีที่สต๊อกเริ่มต่ำ
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <BarChart3 size={28} />
              </div>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">ภาพรวมยอดขายรายวัน</h3>
                <p className="mt-1 text-sm text-slate-500">โครงสำหรับเชื่อมกราฟจริงในขั้นถัดไป</p>
              </div>
            </div>

            {dashboardLoading ? (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">กำลังโหลดข้อมูลกราฟยอดขาย...</p>
              </div>
            ) : dashboardError ? (
              <div className="flex h-80 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-medium text-rose-700">{dashboardError}</p>
              </div>
            ) : hasDailySales ? (
              <div className="flex h-80 items-end gap-3 rounded-2xl bg-slate-50 p-4">
                {dailySales.map((item) => {
                  const amount = Number(item?.amount || 0);
                  const heightPercent = Math.max((amount / maxDailyAmount) * 100, 8);

                  return (
                    <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div className="text-xs font-medium text-slate-500">{formatNumber(amount)}</div>
                      <div className="flex h-full w-full items-end">
                        <div
                          className="w-full rounded-t-2xl bg-blue-600 transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <div className="text-xs font-semibold text-slate-600">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">ยังไม่มีข้อมูลยอดขายรายวันในช่วงเวลานี้</p>
              </div>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">สัญญาณที่ควรติดตาม</h3>
              <p className="mt-1 text-sm text-slate-500">ใช้แทน alert dialog ด้วยข้อความในหน้าโดยตรง</p>
            </div>

            {dashboardLoading ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-12 text-center">
                <p className="text-sm font-medium text-slate-500">กำลังโหลดสัญญาณที่ควรติดตาม...</p>
              </div>
            ) : hasRisks ? (
              <div className="space-y-3">
                {risks.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                  >
                    <div className="mt-0.5 text-amber-600">
                      <AlertTriangle size={18} />
                    </div>
                    <p className="text-sm font-medium text-amber-900">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
                <p className="text-sm font-medium text-slate-500">ยังไม่มีสัญญาณเตือนในช่วงเวลานี้</p>
              </div>
            )}
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">สินค้าขายดี</h3>
              <p className="mt-1 text-sm text-slate-500">Top products จากจำนวนขายและมูลค่า</p>
            </div>
            <Link
              to="/pos/reports/sales/products"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">สินค้า</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">จำนวนขาย</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">ยอดขาย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {dashboardLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                        กำลังโหลดข้อมูลสินค้าขายดี...
                      </td>
                    </tr>
                  ) : hasTopProducts ? (
                    topProducts.map((item, index) => (
                      <tr key={item.id || `${item.name}-${index}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {formatNumber(item.qty)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.sales)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                        ยังไม่มีข้อมูลสินค้าขายดีในช่วงเวลานี้
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesDashboardPage;


