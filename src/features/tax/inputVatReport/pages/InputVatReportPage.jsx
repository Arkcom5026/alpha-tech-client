import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ReceiptText, ShieldCheck } from 'lucide-react';
import { getInputVatReport } from '../api/inputVatReportApi';
import { getInputTaxErrorMessage } from '../../contracts/inputTaxErrorMessages';

const money = (value) => Number(value || 0).toLocaleString('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const thaiDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('th-TH');
};

const InputVatReportPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState({ data: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const next = await getInputVatReport({ month, year });
      setReport(next || { data: [], summary: {} });
    } catch (err) {
      setError(getInputTaxErrorMessage(err, 'ไม่สามารถโหลดรายงานภาษีซื้อได้'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const rows = Array.isArray(report?.data) ? report.data : [];
  const summary = report?.summary || {};
  const authorityCount = useMemo(
    () => rows.filter((row) => row.authority === 'INPUT_VAT_RECORD').length,
    [rows],
  );

  return (
    <section className="space-y-5 p-1 md:p-2">
      <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-700">
              <ReceiptText className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">Input VAT Report</span>
            </div>
            <h1 className="mt-2 text-2xl font-black text-slate-900">รายงานภาษีซื้อ</h1>
            <p className="mt-1 text-sm text-slate-500">อ่านรายการอนุมัติจาก Input VAT authority ตามสาขาของผู้ใช้</p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="text-xs font-bold text-slate-500">
              เดือน
              <select
                className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-500">
              ปี ค.ศ.
              <input
                className="mt-1 w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800"
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={loadReport}
              disabled={loading}
              title={loading ? 'กำลังโหลดรายงานภาษีซื้อ' : 'โหลดข้อมูลรายงานภาษีซื้ออีกครั้ง'}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              รีเฟรช
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs font-bold text-slate-400">รายการ</div><div className="mt-1 text-2xl font-black text-slate-900">{rows.length}</div></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs font-bold text-slate-400">มูลค่าก่อน VAT</div><div className="mt-1 text-xl font-black text-slate-900">฿{money(summary.totalAmount)}</div></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs font-bold text-slate-400">ภาษีซื้อ</div><div className="mt-1 text-xl font-black text-emerald-700">฿{money(summary.vatAmount)}</div></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className="text-xs font-bold text-slate-400">ยอดรวม</div><div className="mt-1 text-xl font-black text-slate-900">฿{money(summary.grandTotal)}</div></div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          <div className="font-black text-slate-900">สมุดบัญชีภาษีซื้อ</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            INPUT_VAT_RECORD {authorityCount} รายการ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-black text-slate-500">
              <tr>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">เลขที่ใบกำกับ</th>
                <th className="px-4 py-3">ผู้ขาย</th>
                <th className="px-4 py-3">เลขผู้เสียภาษี</th>
                <th className="px-4 py-3 text-right">ก่อน VAT</th>
                <th className="px-4 py-3 text-right">VAT</th>
                <th className="px-4 py-3 text-right">รวม</th>
                <th className="px-4 py-3">Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center font-bold text-slate-400">กำลังโหลดรายงาน...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-10 text-center font-bold text-slate-400">ไม่พบรายการภาษีซื้อในช่วงเวลานี้</td></tr>
              ) : rows.map((row) => (
                <tr key={`${row.authority}:${row.id}`} className="hover:bg-emerald-50/30">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">{thaiDate(row.supplierTaxInvoiceDate || row.date)}</td>
                  <td className="px-4 py-3 font-black text-slate-900">{row.supplierTaxInvoiceNumber || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{row.supplierName || '-'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.supplierTaxId || '-'}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-700">{money(row.totalAmount)}</td>
                  <td className="px-4 py-3 text-right font-black text-emerald-700">{money(row.vatAmount)}</td>
                  <td className="px-4 py-3 text-right font-black text-slate-900">{money(row.grandTotal)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[11px] font-black ${row.authority === 'INPUT_VAT_RECORD' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{row.authority}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default InputVatReportPage;
