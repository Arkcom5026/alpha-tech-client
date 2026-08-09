import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listCustomerMoneyReceives } from '../api/customerMoneyReceiveApi';

const paymentMethodLabel = (value) => ({
  CASH: 'เงินสด',
  TRANSFER: 'โอนเงิน',
  QR: 'QR',
  CARD: 'บัตร',
  E_WALLET: 'E-Wallet',
  CHEQUE: 'เช็ค',
  OTHER: 'อื่น ๆ',
  DEPOSIT: 'เงินฝาก/มัดจำเดิม',
}[value] || value || '-');

const customerLabel = (customer) => customer?.companyName || customer?.name || '-';
const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateTime = (value) => value ? new Date(value).toLocaleString('th-TH') : '-';

const initialFilters = {
  search: '',
  status: '',
  paymentMethod: '',
  dateFrom: '',
  dateTo: '',
};

const CustomerMoneyReceiveListPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => value));
      setRows(await listCustomerMoneyReceives({ ...params, take: 200 }));
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.message || err?.message || 'โหลดประวัติการรับเงินไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const summary = useMemo(() => rows.reduce((acc, row) => {
    acc.total += Number(row.amount || 0);
    if (row.status === 'ACTIVE') acc.active += 1;
    if (row.status === 'CANCELLED') acc.cancelled += 1;
    return acc;
  }, { total: 0, active: 0, cancelled: 0 }), [rows]);

  const submitFilters = (event) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 md:p-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-100 p-2 text-teal-800"><FileText className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">ประวัติการรับเงินจากลูกค้า</h1>
            <p className="text-sm text-slate-500">ค้นหา ดูรายละเอียด พิมพ์ และตรวจสอบเอกสาร Customer Money Receipt</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('./create')} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
          <Plus className="h-4 w-4" /> รับเงิน
        </button>
      </header>

      <form onSubmit={submitFilters} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,2fr)_1fr_1fr_1fr_1fr_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 outline-none focus:border-teal-500" placeholder="เลข CMR, ชื่อลูกค้า, Tax ID, เลขอ้างอิง" />
          </label>
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="h-11 rounded-xl border border-slate-300 px-3">
            <option value="">ทุกสถานะ</option><option value="ACTIVE">ใช้งาน</option><option value="CANCELLED">ยกเลิก</option>
          </select>
          <select value={filters.paymentMethod} onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))} className="h-11 rounded-xl border border-slate-300 px-3">
            <option value="">ทุกช่องทาง</option><option value="CASH">เงินสด</option><option value="TRANSFER">โอนเงิน</option><option value="QR">QR</option><option value="CARD">บัตร</option><option value="E_WALLET">E-Wallet</option><option value="CHEQUE">เช็ค</option><option value="OTHER">อื่น ๆ</option>
          </select>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} className="h-11 rounded-xl border border-slate-300 px-3" aria-label="วันที่เริ่มต้น" />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} className="h-11 rounded-xl border border-slate-300 px-3" aria-label="วันที่สิ้นสุด" />
          <div className="flex gap-2">
            <button type="submit" className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white">ค้นหา</button>
            <button type="button" onClick={resetFilters} className="h-11 rounded-xl border border-slate-300 px-3 text-sm font-semibold text-slate-700">ล้าง</button>
          </div>
        </div>
      </form>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">เอกสารที่แสดง</div><div className="mt-1 text-2xl font-bold text-slate-900">{rows.length}</div></div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-xs text-emerald-700">ใช้งาน / ยกเลิก</div><div className="mt-1 text-2xl font-bold text-emerald-950">{summary.active} / {summary.cancelled}</div></div>
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4"><div className="text-xs text-teal-700">ยอดรับเงินตามผลค้นหา</div><div className="mt-1 text-2xl font-bold text-teal-950">฿{money(summary.total)}</div></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-900">รายการใบรับเงิน</h2>
          <button type="button" onClick={loadRows} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> รีเฟรช</button>
        </div>
        {error && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">เลขเอกสาร</th><th className="px-4 py-3">วันที่รับเงิน</th><th className="px-4 py-3">ลูกค้า</th><th className="px-4 py-3">ช่องทาง</th><th className="px-4 py-3 text-right">จำนวนเงิน</th><th className="px-4 py-3">ผู้รับเงิน</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">กำลังโหลดประวัติ...</td></tr> : rows.length === 0 ? <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">ไม่พบรายการรับเงินตามเงื่อนไข</td></tr> : rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.documentNo}</td>
                  <td className="px-4 py-3 text-slate-600">{dateTime(row.receivedAt)}</td>
                  <td className="px-4 py-3"><div className="font-medium text-slate-900">{customerLabel(row.customer)}</div><div className="text-xs text-slate-500">{row.customer?.taxId || '-'}</div></td>
                  <td className="px-4 py-3 text-slate-600">{paymentMethodLabel(row.paymentMethod)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">฿{money(row.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.receivedBy?.name || `#${row.receivedBy?.id || '-'}`}</td>
                  <td className="px-4 py-3">{row.status === 'CANCELLED' ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">ยกเลิก</span> : <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">ใช้งาน</span>}</td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => navigate(`./${row.id}`)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold">รายละเอียด</button><button type="button" onClick={() => navigate(`./${row.id}/print`)} className="rounded-lg border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">พิมพ์</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default CustomerMoneyReceiveListPage;
