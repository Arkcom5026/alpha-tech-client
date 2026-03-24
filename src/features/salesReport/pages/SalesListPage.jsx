



// src/features/salesReport/pages/SalesListPage.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSalesReportStore from '@/features/salesReport/stores/salesReportStore';

// ✅ local helpers (scoped fix)
const KPI_CARD_CLASS =
  'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md';

const formatNumber = (value) =>
  new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatCurrency = (value) => `฿${formatNumber(value)}`;

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatDateLabel = (value) => {
  if (!value) return '';

  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return String(value);

  return `${day}/${month}/${Number(year) + 543}`;
};


const paymentMethodLabelMap = {
  ALL: 'ทั้งหมด',
  CASH: 'เงินสด',
  TRANSFER: 'โอนเงิน',
  CARD: 'บัตร',
  QR: 'QR',
};

const statusLabelMap = {
  ALL: 'ทั้งหมด',
  DRAFT: 'รอดำเนินการ',
  DELIVERED: 'จัดส่งแล้ว',
  FINALIZED: 'ปิดรายการ',
  COMPLETED: 'สำเร็จ',
  CANCELLED: 'ยกเลิก',
};

const statusClassMap = {
  DRAFT: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  DELIVERED: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  FINALIZED: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
};

const SalesListPage = () => {
  const navigate = useNavigate();
  const filters = useSalesReportStore((state) => state.filters);
  const salesList = useSalesReportStore((state) => state.salesList);
  const salesListLoading = useSalesReportStore((state) => state.salesListLoading);
  const salesListError = useSalesReportStore((state) => state.salesListError);
  const fetchSalesListAction = useSalesReportStore((state) => state.fetchSalesListAction);
  const setFiltersAction = useSalesReportStore((state) => state.setFiltersAction);
  const resetFiltersAction = useSalesReportStore((state) => state.resetFiltersAction);

  const [keywordInput, setKeywordInput] = useState(filters?.keyword || '');

  const summary = salesList?.summary || {
    totalSales: 0,
    totalBills: 0,
    avgPerBill: 0,
    totalDiscount: 0,
    totalVat: 0,
  };
  const rows = Array.isArray(salesList?.rows) ? salesList.rows : [];
  const pagination = salesList?.pagination || {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1,
  };

  const sorting = salesList?.sorting || {
    sortBy: filters?.sortBy || 'soldAt',
    sortDirection: filters?.sortDirection || 'desc',
  };

  useEffect(() => {
    fetchSalesListAction();
  }, [fetchSalesListAction]);

  useEffect(() => {
    setKeywordInput(filters?.keyword || '');
  }, [filters?.keyword]);

  const dateRangeLabel = useMemo(() => {
    if (filters?.dateFrom && filters?.dateTo) {
      return `${formatDateLabel(filters.dateFrom)} - ${formatDateLabel(filters.dateTo)}`;
    }
    if (filters?.dateFrom) return `ตั้งแต่ ${formatDateLabel(filters.dateFrom)}`;
    if (filters?.dateTo) return `ถึง ${formatDateLabel(filters.dateTo)}`;
    return 'ทั้งหมด';
  }, [filters?.dateFrom, filters?.dateTo]);

  const handleSearchSubmit = () => {
    fetchSalesListAction({ keyword: keywordInput, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    const nextValue = value ?? '';
    setFiltersAction({ [key]: nextValue });
    fetchSalesListAction({ [key]: nextValue, page: 1 });
  };

  const handleDateChange = (key, value) => {
    setFiltersAction({ [key]: value ?? '' });
  };

  const handleApplyDateFilter = () => {
    fetchSalesListAction({
      keyword: keywordInput,
      dateFrom: filters?.dateFrom || '',
      dateTo: filters?.dateTo || '',
      page: 1,
    });
  };

  const handleResetDateFilter = () => {
    resetFiltersAction();
    setKeywordInput('');
    fetchSalesListAction({
      keyword: '',
      paymentMethod: 'ALL',
      status: 'ALL',
      dateFrom: '',
      dateTo: '',
      page: 1,
    });
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === pagination.page) return;
    fetchSalesListAction({ page: nextPage });
  };

  const getNextSortDirection = (field) => {
    if (sorting.sortBy !== field) return 'desc';
    return sorting.sortDirection === 'desc' ? 'asc' : 'desc';
  };

  const handleSortChange = (field) => {
    fetchSalesListAction({
      sortBy: field,
      sortDirection: getNextSortDirection(field),
      page: 1,
    });
  };

  const renderSortLabel = (label, field) => {
    if (sorting.sortBy !== field) return `${label} ↕`;
    return `${label} ${sorting.sortDirection === 'desc' ? '↓' : '↑'}`;
  };

  const handleOpenSaleDetail = (saleId) => {
    if (!saleId) return;
    navigate(`/pos/reports/sales/${saleId}`);
  };

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Sales Report</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              รายการขาย
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              ใช้ตรวจสอบบิลขายทั้งหมดของสาขา พร้อม filter, audit, และ drill-down ไปยังรายละเอียดบิล
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/pos/reports/sales"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              กลับ Dashboard
            </Link>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ส่งออกข้อมูล
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className={KPI_CARD_CLASS}>
            <p className="text-sm font-medium text-slate-500">ยอดขายรวม</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalSales)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm font-medium text-slate-500">จำนวนบิล</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(summary.totalBills)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm font-medium text-slate-500">เฉลี่ยต่อบิล</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.avgPerBill)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm font-medium text-slate-500">ส่วนลดรวม</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalDiscount)}</h2>
          </article>

          <article className={KPI_CARD_CLASS}>
            <p className="text-sm font-medium text-slate-500">VAT รวม</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(summary.totalVat)}</h2>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">ค้นหา</label>
              <input
                type="text"
                value={keywordInput}
                placeholder="ค้นหาเลขบิล / ลูกค้า / พนักงาน"
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearchSubmit();
                }}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">การชำระเงิน</label>
              <select
                value={filters?.paymentMethod || 'ALL'}
                onChange={(event) => handleFilterChange('paymentMethod', event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {Object.entries(paymentMethodLabelMap).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">สถานะ</label>
              <select
                value={filters?.status || 'ALL'}
                onChange={(event) => handleFilterChange('status', event.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {Object.entries(statusLabelMap).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

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
                onClick={handleSearchSubmit}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 whitespace-nowrap"
              >
                ค้นหา
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleApplyDateFilter}
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 whitespace-nowrap"
              >
                ใช้ตัวกรอง
              </button>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetDateFilter}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 whitespace-nowrap"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="inline-flex items-center rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 whitespace-nowrap">
              ช่วงข้อมูลปัจจุบัน: {dateRangeLabel}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">ตารางรายการขาย</h3>
              <p className="mt-1 text-sm text-slate-500">
                ทั้งหมด {formatNumber(pagination.total)} รายการ • คลิกทั้งแถวเพื่อดู Drill-down ได้ทันที
              </p>
            </div>
          </div>

          {salesListError ? (
            <div className="px-6 py-5">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {salesListError}
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 sticky top-0 z-10">
              
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">เลขบิล</th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() => handleSortChange('soldAt')}
                      className="inline-flex items-center gap-1 hover:text-blue-600"
                    >
                      {renderSortLabel('วันที่ / เวลา', 'soldAt')}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ลูกค้า</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">พนักงาน</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">จำนวนสินค้า</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() => handleSortChange('totalAmount')}
                      className="inline-flex w-full items-center justify-end gap-1 hover:text-blue-600"
                    >
                      {renderSortLabel('ยอดรวม', 'totalAmount')}
                    </button>
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-slate-700">ชำระเงิน</th>

                  <th className="px-4 py-3 text-center font-semibold text-slate-700">สถานะ</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {salesListLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                      <div className="animate-pulse">กำลังโหลดรายการขาย...</div>
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => handleOpenSaleDetail(row.id)}
                      className="cursor-pointer odd:bg-white even:bg-slate-50 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigator.clipboard?.writeText?.(row.saleNo);
                          }}
                          title="คลิกเพื่อคัดลอกเลขบิล"
                          className="inline-flex items-center gap-2 rounded-lg text-left transition hover:text-blue-600"
                        >
                          <span>{row.saleNo}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(row.soldAt)}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-40 truncate">{row.customerName}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-40 truncate">{row.employeeName}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 tabular-nums">
                        {formatNumber(row.itemCount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(row.totalAmount)}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {paymentMethodLabelMap[row.paymentMethod] || row.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassMap[row.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}
                        >
                          {statusLabelMap[row.status] || row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/pos/reports/sales/${row.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          ดูรายละเอียด
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm font-medium text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <span>📭</span>
                        <span>ยังไม่มีรายการขายในช่วงเวลาที่เลือก</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              หน้า {formatNumber(pagination.page)} / {formatNumber(pagination.totalPages)}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={salesListLoading || pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={salesListLoading || pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SalesListPage;









