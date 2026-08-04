import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  executeMerchantProductReservationLifecycle,
  getMerchantProductReservation,
} from '../api/productReservationMerchantApi';

const STATUS_META = Object.freeze({
  ACTIVE: { label: 'รอร้านรับใบจอง', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
  ACCEPTED: { label: 'ร้านรับใบจองแล้ว', tone: 'border-blue-200 bg-blue-50 text-blue-800' },
  FULFILLMENT_READY: { label: 'เตรียมสินค้าเรียบร้อย', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  READY_FOR_PICKUP: { label: 'พร้อมให้ลูกค้ารับ', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  CANCELLED: { label: 'ยกเลิกแล้ว', tone: 'border-rose-200 bg-rose-50 text-rose-800' },
  EXPIRED: { label: 'หมดอายุ', tone: 'border-slate-200 bg-slate-100 text-slate-700' },
});

const COMMAND_LABELS = Object.freeze({
  ACCEPT: 'รับใบจอง',
  CANCEL: 'ยกเลิกใบจอง',
  EXPIRE: 'ใบจองหมดอายุ',
  MARK_FULFILLMENT_READY: 'เตรียมสินค้าเรียบร้อย',
});

const formatMoney = (value) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const createIdempotencyKey = (reservationId, commandType) => {
  const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `merchant-reservation:${reservationId}:${commandType}:${suffix}`;
};

const ProductReservationDetailPage = () => {
  const { reservationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submittingCommand, setSubmittingCommand] = useState('');

  const loadReservation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await getMerchantProductReservation(reservationId));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถโหลดใบจองได้');
    } finally {
      setLoading(false);
    }
  }, [reservationId]);

  useEffect(() => {
    loadReservation();
  }, [loadReservation]);

  const executeLifecycle = useCallback(async (commandType, reason = null) => {
    setSubmittingCommand(commandType);
    setError('');
    setSuccess('');
    try {
      await executeMerchantProductReservationLifecycle({
        reservationId,
        commandType,
        reason,
        idempotencyKey: createIdempotencyKey(reservationId, commandType),
      });
      setSuccess(commandType === 'ACCEPT' ? 'รับใบจองเรียบร้อยแล้ว' : 'ยกเลิกใบจองเรียบร้อยแล้ว');
      await loadReservation();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถเปลี่ยนสถานะใบจองได้');
    } finally {
      setSubmittingCommand('');
    }
  }, [loadReservation, reservationId]);

  const cancelReservation = useCallback(() => {
    const reason = window.prompt('ระบุเหตุผลที่ยกเลิกใบจอง');
    if (reason == null) return;
    const normalizedReason = reason.trim();
    if (!normalizedReason) {
      setError('กรุณาระบุเหตุผลที่ยกเลิกใบจอง');
      return;
    }
    executeLifecycle('CANCEL', normalizedReason);
  }, [executeLifecycle]);

  const reservation = data?.reservation;
  const items = data?.items || [];
  const timeline = data?.timeline || [];
  const statusMeta = useMemo(
    () => STATUS_META[reservation?.status] || { label: reservation?.status || '—', tone: 'border-slate-200 bg-slate-50 text-slate-700' },
    [reservation?.status],
  );

  if (loading && !data) return <div className="p-10 text-center font-bold text-slate-500">กำลังโหลดรายละเอียดใบจอง...</div>;
  if (!reservation) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-700">{error || 'ไม่พบใบจอง'}</div>
      </div>
    );
  }

  const canAccept = reservation.status === 'ACTIVE';
  const canCancel = ['ACTIVE', 'ACCEPTED'].includes(reservation.status);
  const canOpenPosSale = ['ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP'].includes(reservation.status);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <Link to=".." relative="path" className="text-sm font-black text-blue-700">← กลับรายการใบจอง</Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Merchant Reservation Detail</p>
              <h1 className="mt-2 text-2xl font-black text-slate-950 md:text-3xl">{reservation.code}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusMeta.tone}`}>{statusMeta.label}</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                  {reservation.fulfillmentMethod === 'PICKUP' ? 'รับสินค้าที่ร้าน' : reservation.fulfillmentMethod}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">สร้างเมื่อ {formatDateTime(reservation.createdAt)} · หมดอายุ {formatDateTime(reservation.expiresAt)}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-6 py-5 text-left lg:text-right">
              <p className="text-xs font-bold text-amber-700">ยอดจอง</p>
              <p className="text-3xl font-black text-slate-950">{formatMoney(reservation.totalAmount)}</p>
            </div>
          </div>

          {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</div> : null}
          {success ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{success}</div> : null}

          {(canAccept || canCancel || canOpenPosSale) ? (
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:flex-wrap">
              {canAccept ? (
                <button
                  type="button"
                  onClick={() => executeLifecycle('ACCEPT')}
                  disabled={Boolean(submittingCommand)}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingCommand === 'ACCEPT' ? 'กำลังรับใบจอง...' : 'รับใบจอง'}
                </button>
              ) : null}
              {canOpenPosSale ? (
                <Link
                  to="sale"
                  relative="path"
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  นำใบจองเข้าสู่หน้าขาย POS
                </Link>
              ) : null}
              {canCancel ? (
                <button
                  type="button"
                  onClick={cancelReservation}
                  disabled={Boolean(submittingCommand)}
                  className="rounded-xl border border-rose-300 bg-white px-6 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingCommand === 'CANCEL' ? 'กำลังยกเลิก...' : 'ยกเลิกใบจอง'}
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-black text-slate-950">รายการสินค้า</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <article key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-black text-slate-950">{item.productName}</p>
                  <p className="mt-1 text-xs text-slate-500">Product ID {item.productId} · Stock Item {item.stockItemId || '—'}</p>
                </div>
                <p className="font-bold text-slate-700">{item.quantity} ชิ้น</p>
                <p className="font-black text-slate-950">{formatMoney(Number(item.price) * Number(item.quantity))}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-black text-slate-950">Timeline ใบจอง</h2>
            <p className="mt-1 text-sm text-slate-500">หลักฐานการเปลี่ยนสถานะจาก Server</p>
          </div>
          {timeline.length === 0 ? (
            <div className="p-8 text-center text-sm font-bold text-slate-500">ยังไม่มีเหตุการณ์ Lifecycle</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {timeline.map((event) => (
                <article key={event.id} className="grid gap-2 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="font-black text-slate-950">{COMMAND_LABELS[event.commandType] || event.commandType}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.fromStatus || 'เริ่มต้น'} → {event.toStatus}</p>
                    {event.reason ? <p className="mt-1 text-sm font-bold text-rose-700">เหตุผล: {event.reason}</p> : null}
                  </div>
                  <div className="text-xs text-slate-500 md:text-right">
                    <p>{formatDateTime(event.occurredAt || event.createdAt)}</p>
                    <p className="mt-1">พนักงาน #{event.actorId || 'ระบบ'}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProductReservationDetailPage;
