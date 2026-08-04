import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listMerchantProductReservations } from '../api/productReservationMerchantApi';

const STATUS_META = Object.freeze({
  ACTIVE: { label: 'รอร้านรับใบจอง', tone: 'bg-amber-100 text-amber-800 border-amber-200' },
  ACCEPTED: { label: 'ร้านรับใบจองแล้ว', tone: 'bg-blue-100 text-blue-800 border-blue-200' },
  FULFILLMENT_READY: { label: 'เตรียมสินค้าเรียบร้อย', tone: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  READY_FOR_PICKUP: { label: 'พร้อมให้ลูกค้ารับ', tone: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  COMPLETED: { label: 'เสร็จสิ้น', tone: 'bg-slate-100 text-slate-700 border-slate-200' },
  CANCELLED: { label: 'ยกเลิก', tone: 'bg-rose-100 text-rose-800 border-rose-200' },
  EXPIRED: { label: 'หมดอายุ', tone: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
});

const FILTERS = [
  { key: 'OPEN', label: 'งานที่ต้องจัดการ', statuses: ['ACTIVE', 'ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP'] },
  { key: 'ACTIVE', label: 'รอรับใบจอง', statuses: ['ACTIVE'] },
  { key: 'ACCEPTED', label: 'รับแล้ว', statuses: ['ACCEPTED'] },
  { key: 'READY', label: 'เตรียมเสร็จ', statuses: ['FULFILLMENT_READY', 'READY_FOR_PICKUP'] },
  { key: 'HISTORY', label: 'ประวัติ', statuses: ['COMPLETED', 'CANCELLED', 'EXPIRED'] },
  { key: 'ALL', label: 'ทั้งหมด', statuses: [] },
];

const formatMoney = (value) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const remainingText = (expiresAt, now) => {
  if (!expiresAt) return 'ไม่กำหนดเวลา';
  const remaining = new Date(expiresAt).getTime() - now;
  if (remaining <= 0) return 'หมดเวลาแล้ว';
  const minutes = Math.ceil(remaining / 60000);
  if (minutes < 60) return `เหลือ ${minutes} นาที`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `เหลือ ${hours} ชม.${rest ? ` ${rest} นาที` : ''}`;
};

const ProductReservationInboxPage = () => {
  const [filterKey, setFilterKey] = useState('OPEN');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  const activeFilter = useMemo(
    () => FILTERS.find((filter) => filter.key === filterKey) || FILTERS[0],
    [filterKey],
  );

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listMerchantProductReservations({ statuses: activeFilter.statuses, limit: 100 });
      setReservations(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || loadError?.message || 'ไม่สามารถโหลดรายการใบจองได้');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const summary = useMemo(() => {
    const result = { total: reservations.length, active: 0, accepted: 0, ready: 0 };
    reservations.forEach((reservation) => {
      if (reservation.status === 'ACTIVE') result.active += 1;
      if (reservation.status === 'ACCEPTED') result.accepted += 1;
      if (['FULFILLMENT_READY', 'READY_FOR_PICKUP'].includes(reservation.status)) result.ready += 1;
    });
    return result;
  }, [reservations]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Merchant Reservation Workspace</p>
              <h1 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">ใบจองสินค้าออนไลน์</h1>
              <p className="mt-2 text-sm text-slate-600">รับช่วงใบจองจากหน้าร้านออนไลน์ เฉพาะข้อมูลของร้านปัจจุบัน</p>
            </div>
            <button
              type="button"
              onClick={loadReservations}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรายการใหม่'}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['รายการที่แสดง', summary.total, 'text-slate-950'],
            ['รอร้านรับ', summary.active, 'text-amber-700'],
            ['รับแล้ว', summary.accepted, 'text-blue-700'],
            ['เตรียมเสร็จ', summary.ready, 'text-emerald-700'],
          ].map(([label, value, tone]) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <p className={`mt-2 text-3xl font-black ${tone}`}>{value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setFilterKey(filter.key)}
                className={`rounded-full px-4 py-2 text-sm font-black transition ${
                  filterKey === filter.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {error ? (
            <div className="m-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div>
          ) : null}

          {loading ? (
            <div className="p-12 text-center text-sm font-bold text-slate-500">กำลังโหลดใบจองของร้าน...</div>
          ) : reservations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">📋</div>
              <h2 className="mt-3 text-lg font-black text-slate-900">ยังไม่มีใบจองในกลุ่มนี้</h2>
              <p className="mt-1 text-sm text-slate-500">เมื่อมีลูกค้าจองสินค้า รายการจะเข้ามาที่ศูนย์งานนี้โดยอัตโนมัติ</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reservations.map((reservation) => {
                const meta = STATUS_META[reservation.status] || { label: reservation.status, tone: 'bg-slate-100 text-slate-700 border-slate-200' };
                const expired = reservation.expiresAt && new Date(reservation.expiresAt).getTime() <= now;
                return (
                  <article key={reservation.id} className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1.5fr_1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-slate-950">{reservation.code}</h2>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${meta.tone}`}>{meta.label}</span>
                        {reservation.orderSource === 'ONLINE' ? (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700">ออนไลน์</span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {reservation.itemCount} รายการ · {reservation.totalQuantity} ชิ้น · {reservation.fulfillmentMethod === 'PICKUP' ? 'รับสินค้าที่ร้าน' : reservation.fulfillmentMethod}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">สร้างเมื่อ {formatDateTime(reservation.createdAt)}</p>
                    </div>

                    <div className="space-y-1 lg:text-right">
                      <p className="text-xs font-bold text-slate-500">ยอดจอง</p>
                      <p className="text-xl font-black text-slate-950">{formatMoney(reservation.totalAmount)}</p>
                      <p className={`text-xs font-black ${expired ? 'text-rose-600' : 'text-amber-700'}`}>
                        {remainingText(reservation.expiresAt, now)}
                      </p>
                      <p className="text-xs text-slate-500">หมดอายุ {formatDateTime(reservation.expiresAt)}</p>
                    </div>

                    <Link
                      to={`/pos/sales/reservations/${reservation.id}`}
                      className="inline-flex min-w-32 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                    >
                      เปิดใบจอง
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProductReservationInboxPage;
