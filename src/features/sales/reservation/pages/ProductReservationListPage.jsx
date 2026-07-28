import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardList, RefreshCw, Search } from 'lucide-react';

import { listProductReservations } from '../api/productReservationApi';

const STATUSES = ['', 'ACTIVE', 'PARTIALLY_PAID', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED', 'EXPIRED'];
const statusLabel = {
  ACTIVE: 'กำลังจอง',
  PARTIALLY_PAID: 'ชำระบางส่วน',
  READY_FOR_PICKUP: 'พร้อมรับสินค้า',
  COMPLETED: 'ขายแล้ว',
  CANCELLED: 'ยกเลิก',
  EXPIRED: 'หมดอายุ',
};

const money = (value) => Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateTime = (value) => value ? new Date(value).toLocaleString('th-TH') : '-';

export default function ProductReservationListPage() {
  const { shopSlug } = useParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await listProductReservations({ status: status || undefined, keyword: keyword.trim() || undefined });
      setItems(result.items);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'โหลดรายการใบจองไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-3 md:p-5 space-y-4 text-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            <h1 className="text-lg md:text-xl font-black">ใบบันทึกการจองสินค้า</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">ติดตามสถานะสินค้าและดำเนินการส่งมอบหรือแปลงเป็นการขาย</p>
        </div>
        <Link to={`/${shopSlug}/pos/sales/reservations/create`} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-black text-center">
          + สร้างใบจอง
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="ค้นหาเลขที่ใบจอง" className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-slate-900" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 px-3 rounded-xl border border-slate-200 text-sm font-bold">
          {STATUSES.map((value) => <option key={value || 'ALL'} value={value}>{value ? statusLabel[value] : 'ทุกสถานะ'}</option>)}
        </select>
        <button onClick={load} disabled={loading} className="h-9 px-4 rounded-xl border border-slate-300 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> โหลดข้อมูล
        </button>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm font-bold">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr><th className="text-left px-4 py-3">เลขที่</th><th className="text-left px-4 py-3">สถานะ</th><th className="text-right px-4 py-3">รายการ</th><th className="text-right px-4 py-3">ยอดรวม</th><th className="text-left px-4 py-3">กำหนดรับ</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && items.length === 0 && <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-400">ไม่พบใบจองสินค้า</td></tr>}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><div className="font-black">{item.code}</div><div className="text-[11px] text-slate-400">{dateTime(item.createdAt)}</div></td>
                <td className="px-4 py-3 font-bold">{statusLabel[item.status] || item.status}</td>
                <td className="px-4 py-3 text-right">{item.itemCount || 0}</td>
                <td className="px-4 py-3 text-right font-black">฿{money(item.totalAmount)}</td>
                <td className="px-4 py-3">{dateTime(item.pickupAt || item.expiresAt)}</td>
                <td className="px-4 py-3 text-right"><Link className="font-black text-slate-900 underline" to={`/${shopSlug}/pos/sales/reservations/${item.id}`}>ดูรายละเอียด</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
