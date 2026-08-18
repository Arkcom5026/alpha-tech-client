import React, { useCallback, useEffect, useState } from 'react';
import { FilePlus2, FileText, RefreshCw, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { feedback } from '@/design-system';
import { listQuotations } from '../api/quotationApi';

const STATUS_LABELS = {
  DRAFT: 'ร่าง',
  ISSUED: 'ออกเอกสารแล้ว',
  ACCEPTED: 'ลูกค้ายอมรับ',
  REJECTED: 'ลูกค้าปฏิเสธ',
  EXPIRED: 'หมดอายุ',
  CANCELLED: 'ยกเลิก',
  CONVERTED: 'Legacy converted',
};

const formatMoney = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDate = (value) => value ? new Date(value).toLocaleDateString('th-TH') : '-';

const QuotationListPage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const prefix = `/${shopSlug || 'advancetech'}/pos/sales/quotations`;
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQuotations({ query, status });
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      feedback.actionError(error, 'โหลดรายการใบเสนอราคาไม่สำเร็จ', 'quotation:list:error');
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-4 p-4 text-slate-800">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-700" />
            <h1 className="text-lg font-bold text-slate-950">ใบเสนอราคา</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">เอกสารที่ออกแล้วคง immutable และสร้าง Revision ใหม่ได้เมื่อลูกค้าขอปรับข้อเสนอ</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`${prefix}/new`)}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <FilePlus2 className="h-4 w-4" />
          สร้างใบเสนอราคา
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเลขที่เอกสาร ลูกค้า หรือหัวข้อ"
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm">
          <option value="">ทุกสถานะ</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={load} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">เลขที่</th>
                <th className="px-4 py-3">Revision</th>
                <th className="px-4 py-3">ลูกค้า / หน่วยงาน</th>
                <th className="px-4 py-3">หัวข้อ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">ยอดรวม</th>
                <th className="px-4 py-3">แก้ไขล่าสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && rows.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-500">ยังไม่มีใบเสนอราคา</td></tr>
              ) : null}
              {rows.map((row) => (
                <tr key={row.id} onClick={() => navigate(`${prefix}/${row.id}`)} className="cursor-pointer hover:bg-teal-50/40">
                  <td className="px-4 py-3 font-semibold text-teal-800">{row.code}</td>
                  <td className="px-4 py-3"><span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-bold text-teal-800">Rev.{Number(row.revisionNumber || 0)}</span></td>
                  <td className="px-4 py-3">{row.customerCompany || row.customerName || 'ยังไม่ระบุ'}</td>
                  <td className="max-w-[28rem] truncate px-4 py-3 text-slate-600">{row.subject || '-'}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{STATUS_LABELS[row.status] || row.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(row.grandTotal)} ฿</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(row.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationListPage;
