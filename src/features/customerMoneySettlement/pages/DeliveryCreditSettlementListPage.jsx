import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listDeliveryCreditSettlements } from '../api/deliveryCreditSettlementApi';

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const customerLabel = (customer) => customer?.companyName || customer?.name || '-';
const statusLabel = (status) => status === 'CANCELLED' ? 'ยกเลิกแล้ว' : status === 'ACTIVE' ? 'ใช้งาน' : status || '-';

const DeliveryCreditSettlementListPage = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRows(await listDeliveryCreditSettlements({ take: 200 }));
    } catch (err) {
      setRows([]);
      setError(err?.response?.data?.message || err?.message || 'โหลดประวัติการตัดยอดไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRows(); }, [loadRows]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 p-3 md:p-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-800"><FileText className="h-5 w-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">ประวัติการตัดยอดใบส่งของเครดิต</h1>
            <p className="text-sm text-slate-500">เอกสารการนำ Customer Money ไปตัดยอดใบส่งของเครดิต โดยไม่กระทบสต๊อก</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('./create')} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800">
          <Plus className="h-4 w-4" /> ตัดยอดใบส่งของ
        </button>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-900">รายการ Settlement</h2>
          <button type="button" onClick={loadRows} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />รีเฟรช</button>
        </div>
        {error && <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-4 py-3">เลขเอกสาร</th><th className="px-4 py-3">วันที่</th><th className="px-4 py-3">ลูกค้า</th><th className="px-4 py-3 text-right">ยอดตัด</th><th className="px-4 py-3">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">กำลังโหลด...</td></tr> : rows.length === 0 ? <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">ยังไม่มีรายการตัดยอดใบส่งของ</td></tr> : rows.map((row) => {
                const cancelled = row.status === 'CANCELLED';
                return <tr key={row.id} className={cancelled ? 'bg-slate-50 text-slate-500' : ''}><td className={`px-4 py-3 font-semibold ${cancelled ? 'line-through' : ''}`}>{row.code}</td><td className="px-4 py-3">{new Date(row.settledAt).toLocaleString('th-TH')}</td><td className="px-4 py-3">{customerLabel(row.customer)}</td><td className={`px-4 py-3 text-right font-bold ${cancelled ? 'line-through' : ''}`}>฿{money(row.totalAmount)}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cancelled ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{statusLabel(row.status)}</span></td><td className="px-4 py-3 text-right"><button type="button" onClick={() => navigate(`./${row.id}`)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">รายละเอียด</button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DeliveryCreditSettlementListPage;