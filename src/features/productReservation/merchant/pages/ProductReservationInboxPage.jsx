import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { listMerchantProductReservations } from '../api/productReservationMerchantApi';

const STATUS_META = Object.freeze({
  ACTIVE: { label: 'รอร้านรับใบจอง', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
  ACCEPTED: { label: 'ร้านรับใบจองแล้ว', tone: 'border-teal-200 bg-teal-50 text-teal-800' },
  FULFILLMENT_READY: { label: 'เตรียมสินค้าเรียบร้อย', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  READY_FOR_PICKUP: { label: 'พร้อมให้ลูกค้ารับ', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  COMPLETED: { label: 'เสร็จสิ้น', tone: 'border-slate-200 bg-slate-100 text-slate-700' },
  CANCELLED: { label: 'ยกเลิก', tone: 'border-rose-200 bg-rose-50 text-rose-800' },
  EXPIRED: { label: 'หมดอายุ', tone: 'border-zinc-200 bg-zinc-100 text-zinc-700' },
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
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

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
  const { shopSlug } = useParams();
  const reservationBasePath = shopSlug
    ? `/${shopSlug}/pos/sales/reservations`
    : '/pos/sales/reservations';

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

  const metrics = [
    { label: 'รายการที่แสดง', value: summary.total, tone: 'text-slate-950' },
    { label: 'รอร้านรับ', value: summary.active, tone: 'text-amber-700' },
    { label: 'รับแล้ว', value: summary.accepted, tone: 'text-teal-700' },
    { label: 'เตรียมเสร็จ', value: summary.ready, tone: 'text-emerald-700' },
  ];

  return (
    <main className="min-h-full bg-slate-50 px-3 py-4 text-slate-800 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-4 md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-teal-700">งานขายออนไลน์ของร้านปัจจุบัน</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 md:text-3xl">ใบจองสินค้าออนไลน์</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                รับ ตรวจสอบ และเตรียมสินค้าตามใบจอง โดยแสดงเฉพาะข้อมูลของร้านปัจจุบัน
              </p>
            </div>
            <button
              type="button"
              onClick={loadReservations}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'กำลังตรวจสอบ' : 'ตรวจสอบรายการใหม่'}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">{metric.label}</p>
              <p className={`mt-2 text-3xl font-semibold ${metric.tone}`}>{metric.value}</p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto border-b border-slate-200 p-3">
            <div className="flex min-w-max gap-2">
              {FILTERS.map((filter) => {
                const active = filterKey === filter.key;
                return (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setFilterKey(filter.key)}
                    className={`min-h-10 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                        : 'border-teal-100 bg-teal-50 text-teal-800 hover:border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">กำลังโหลดใบจองของร้าน...</div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">ยังไม่มีใบจองในกลุ่มนี้</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                เมื่อมีลูกค้าจองสินค้า รายการจะเข้ามาที่ศูนย์งานนี้โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {reservations.map((reservation) => {
                const meta = STATUS_META[reservation.status] || {
                  label: reservation.status,
                  tone: 'border-slate-200 bg-slate-100 text-slate-700',
                };
                const expired = reservation.expiresAt && new Date(reservation.expiresAt).getTime() <= now;

                return (
                  <article key={reservation.id} className="grid gap-4 p-4 transition hover:bg-slate-50 md:p-5 lg:grid-cols-[1.5fr_1fr_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-950">{reservation.code}</h2>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${meta.tone}`}>
                          {meta.label}
                        </span>
                        {reservation.orderSource === 'ONLINE' ? (
                          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                            ออนไลน์
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {reservation.itemCount} รายการ · {reservation.totalQuantity} ชิ้น ·{' '}
                        {reservation.fulfillmentMethod === 'PICKUP' ? 'รับสินค้าที่ร้าน' : reservation.fulfillmentMethod}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">สร้างเมื่อ {formatDateTime(reservation.createdAt)}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 lg:bg-transparent lg:p-0 lg:text-right">
                      <p className="text-xs font-medium text-slate-500">ยอดจอง</p>
                      <p className="mt-1 text-xl font-semibold text-slate-950">{formatMoney(reservation.totalAmount)}</p>
                      <p className={`mt-1 text-xs font-medium ${expired ? 'text-rose-600' : 'text-amber-700'}`}>
                        {remainingText(reservation.expiresAt, now)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">หมดอายุ {formatDateTime(reservation.expiresAt)}</p>
                    </div>

                    <Link
                      to={`${reservationBasePath}/${reservation.id}`}
                      className="inline-flex min-h-11 min-w-32 items-center justify-center rounded-xl bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-200"
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
