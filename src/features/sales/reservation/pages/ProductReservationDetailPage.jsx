import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShoppingCart, XCircle } from 'lucide-react';

import {
  cancelProductReservation,
  convertProductReservationToSale,
  getProductReservation,
  markProductReservationReady,
} from '../api/productReservationApi';

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

export default function ProductReservationDetailPage() {
  const { shopSlug, reservationId } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setReservation(await getProductReservation(reservationId));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'โหลดใบจองไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [reservationId]);

  const runAction = async (action) => {
    try {
      setActing(true);
      setError('');
      await action();
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'ดำเนินการไม่สำเร็จ');
    } finally {
      setActing(false);
    }
  };

  const handleCancel = () => {
    const reason = window.prompt('ระบุเหตุผลการยกเลิกใบจอง') || '';
    if (!reason.trim()) return;
    runAction(() => cancelProductReservation(reservationId, reason.trim()));
  };

  const handleConvert = async () => {
    if (!window.confirm('ยืนยันการแปลงใบจองนี้เป็นการขายเงินสด?')) return;
    try {
      setActing(true);
      setError('');
      const result = await convertProductReservationToSale(reservationId, { mode: 'CASH' });
      const saleId = result?.saleId ?? result?.sale?.id ?? result?.reservation?.convertedSaleId;
      if (saleId) navigate(`/${shopSlug}/pos/sales/bill/print-short/${saleId}`);
      else await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'แปลงใบจองเป็นการขายไม่สำเร็จ');
    } finally {
      setActing(false);
    }
  };

  if (loading && !reservation) return <div className="p-6 text-sm font-bold text-slate-500">กำลังโหลดใบจอง...</div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto p-3 md:p-5 space-y-4 text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <Link to={`/${shopSlug}/pos/sales/reservations`} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500"><ArrowLeft className="w-4 h-4" /> กลับรายการใบจอง</Link>
          <h1 className="text-xl font-black mt-2">{reservation?.code || `ใบจอง #${reservationId}`}</h1>
          <p className="text-xs text-slate-500 mt-1">สร้างเมื่อ {dateTime(reservation?.createdAt)}</p>
        </div>
        <div className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-black">{statusLabel[reservation?.status] || reservation?.status}</div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-700 text-sm font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4"><div className="text-xs text-slate-400">ลูกค้า ID</div><div className="font-black mt-1">{reservation?.customerId || '-'}</div></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4"><div className="text-xs text-slate-400">ยอดรวม</div><div className="font-black mt-1">฿{money(reservation?.totalAmount)}</div></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4"><div className="text-xs text-slate-400">มัดจำ</div><div className="font-black mt-1">฿{money(reservation?.depositAmount)}</div></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4"><div className="text-xs text-slate-400">คงเหลือ</div><div className="font-black mt-1">฿{money(reservation?.outstandingAmount)}</div></div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="text-left px-4 py-3">สินค้า</th><th className="text-left px-4 py-3">บาร์โค้ด / Serial</th><th className="text-right px-4 py-3">จำนวน</th><th className="text-right px-4 py-3">ราคา</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {(reservation?.items || []).map((item) => <tr key={item.id}><td className="px-4 py-3"><div className="font-black">{item.productName}</div><div className="text-[11px] text-slate-400">{item.lineType}</div></td><td className="px-4 py-3 font-mono text-xs">{item.stockBarcode || item.saleBarcode || '-'}<div className="text-slate-400">{item.stockSerialNumber || ''}</div></td><td className="px-4 py-3 text-right">{item.quantity}</td><td className="px-4 py-3 text-right font-black">฿{money(item.price)}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-end gap-2">
        {['ACTIVE', 'PARTIALLY_PAID'].includes(reservation?.status) && <button disabled={acting} onClick={() => runAction(() => markProductReservationReady(reservationId))} className="px-4 py-2 rounded-xl border border-emerald-300 text-emerald-700 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"><CheckCircle2 className="w-4 h-4" /> พร้อมรับสินค้า</button>}
        {['ACTIVE', 'PARTIALLY_PAID', 'READY_FOR_PICKUP'].includes(reservation?.status) && <button disabled={acting} onClick={handleCancel} className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"><XCircle className="w-4 h-4" /> ยกเลิกใบจอง</button>}
        {['ACTIVE', 'PARTIALLY_PAID', 'READY_FOR_PICKUP'].includes(reservation?.status) && <button disabled={acting} onClick={handleConvert} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50"><ShoppingCart className="w-4 h-4" /> แปลงเป็นการขาย</button>}
      </div>
    </div>
  );
}
