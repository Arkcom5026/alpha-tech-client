import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarClock, CheckCircle2, Clock3, PackageCheck, ShoppingCart, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { feedback } from '@/design-system/feedback';
import {
  executeMerchantProductReservationLifecycle,
  getMerchantProductReservation,
} from '../api/productReservationMerchantApi';

const STATUS_META = Object.freeze({
  ACTIVE: { label: 'รอร้านรับใบจอง', tone: 'border-amber-200 bg-amber-50 text-amber-800' },
  ACCEPTED: { label: 'ร้านรับใบจองแล้ว', tone: 'border-teal-200 bg-teal-50 text-teal-800' },
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
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
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
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
    if (submittingCommand) return false;
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
      const successMessage = commandType === 'ACCEPT'
        ? 'รับใบจองเรียบร้อยแล้ว'
        : 'ยกเลิกใบจองเรียบร้อยแล้ว';
      setSuccess(successMessage);
      feedback.actionSuccess(successMessage, `product-reservation:${reservationId}:${commandType}:success`);
      await loadReservation();
      return true;
    } catch (requestError) {
      const fallbackMessage = 'ไม่สามารถเปลี่ยนสถานะใบจองได้';
      setError(requestError?.response?.data?.message || requestError?.message || fallbackMessage);
      feedback.actionError(requestError, fallbackMessage, `product-reservation:${reservationId}:${commandType}:error`);
      return false;
    } finally {
      setSubmittingCommand('');
    }
  }, [loadReservation, reservationId, submittingCommand]);

  const requestCancel = useCallback(() => {
    if (submittingCommand) return;
    setError('');
    setCancelReason('');
    setCancelOpen(true);
  }, [submittingCommand]);

  const closeCancel = useCallback(() => {
    if (submittingCommand) return;
    setCancelOpen(false);
    setCancelReason('');
  }, [submittingCommand]);

  const confirmCancel = useCallback(async () => {
    const normalizedReason = cancelReason.trim();
    if (!normalizedReason) {
      setError('กรุณาระบุเหตุผลที่ยกเลิกใบจอง');
      feedback.info('กรุณาระบุเหตุผลที่ยกเลิกใบจอง');
      return;
    }
    const completed = await executeLifecycle('CANCEL', normalizedReason);
    if (completed) {
      setCancelOpen(false);
      setCancelReason('');
    }
  }, [cancelReason, executeLifecycle]);

  const reservation = data?.reservation;
  const items = data?.items || [];
  const timeline = data?.timeline || [];
  const statusMeta = useMemo(
    () => STATUS_META[reservation?.status] || {
      label: reservation?.status || '—',
      tone: 'border-slate-200 bg-slate-50 text-slate-700',
    },
    [reservation?.status],
  );

  if (loading && !data) {
    return (
      <main className="min-h-full bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
          <Clock3 className="mx-auto h-7 w-7 animate-pulse text-teal-700" />
          <p className="mt-3 text-sm font-semibold text-teal-900">กำลังโหลดรายละเอียดใบจอง</p>
        </div>
      </main>
    );
  }

  if (!reservation) {
    return (
      <main className="min-h-full bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <XCircle className="h-6 w-6" />
          <h1 className="mt-3 text-lg font-semibold">ไม่สามารถเปิดใบจองได้</h1>
          <p className="mt-1 text-sm leading-6">{error || 'ไม่พบใบจอง'}</p>
        </div>
      </main>
    );
  }

  const canAccept = reservation.status === 'ACTIVE';
  const canCancel = ['ACTIVE', 'ACCEPTED'].includes(reservation.status);
  const canOpenPosSale = ['ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP'].includes(reservation.status);

  return (
    <main className="min-h-full bg-slate-50 px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <Link
          to=".."
          relative="path"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-800 hover:bg-teal-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับรายการใบจอง
        </Link>

        <section className="overflow-hidden rounded-2xl border border-teal-200 bg-white">
          <div className="bg-teal-50 p-4 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-teal-700">รายละเอียดใบจองสินค้า</p>
                <h1 className="mt-1 truncate text-2xl font-semibold text-slate-950 md:text-3xl">{reservation.code}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusMeta.tone}`}>{statusMeta.label}</span>
                  <span className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-800">
                    {reservation.fulfillmentMethod === 'PICKUP' ? 'รับสินค้าที่ร้าน' : reservation.fulfillmentMethod}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-teal-700" />สร้างเมื่อ {formatDateTime(reservation.createdAt)}</p>
                  <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-amber-700" />หมดอายุ {formatDateTime(reservation.expiresAt)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 lg:min-w-64 lg:text-right">
                <p className="text-xs font-semibold text-emerald-800">ยอดจอง</p>
                <p className="mt-1 text-3xl font-semibold text-slate-950">{formatMoney(reservation.totalAmount)}</p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {error ? <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</div> : null}
            {success ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</div> : null}

            {(canAccept || canCancel || canOpenPosSale) ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
                  {canAccept ? (
                    <button
                      type="button"
                      onClick={() => executeLifecycle('ACCEPT')}
                      disabled={Boolean(submittingCommand)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {submittingCommand === 'ACCEPT' ? 'กำลังรับใบจอง...' : 'รับใบจอง'}
                    </button>
                  ) : null}
                  {canOpenPosSale ? (
                    <Link
                      to="sale"
                      relative="path"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-200 px-5 text-center text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      นำใบจองเข้าสู่หน้าขาย POS
                    </Link>
                  ) : null}
                  {canCancel && !cancelOpen ? (
                    <button
                      type="button"
                      onClick={requestCancel}
                      disabled={Boolean(submittingCommand)}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300 bg-white px-5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      ยกเลิกใบจอง
                    </button>
                  ) : null}
                </div>

                {canCancel && cancelOpen ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <h2 className="font-semibold text-rose-900">ยืนยันยกเลิกใบจอง</h2>
                    <p className="mt-1 text-sm text-rose-700">ระบุเหตุผลเพื่อบันทึกในประวัติสถานะก่อนยืนยันการยกเลิก</p>
                    <textarea
                      value={cancelReason}
                      onChange={(event) => setCancelReason(event.target.value)}
                      disabled={Boolean(submittingCommand)}
                      rows={3}
                      placeholder="เหตุผลที่ยกเลิกใบจอง"
                      className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
                    />
                    <div className="mt-3 flex justify-end gap-2">
                      <button type="button" onClick={closeCancel} disabled={Boolean(submittingCommand)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">ไม่ยกเลิก</button>
                      <button type="button" onClick={confirmCancel} disabled={Boolean(submittingCommand) || !cancelReason.trim()} className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {submittingCommand === 'CANCEL' ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกใบจอง'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4 md:px-5">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-teal-700" />
              <h2 className="text-lg font-semibold text-slate-950">รายการสินค้า</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">ตรวจจำนวนและมูลค่าก่อนดำเนินการต่อ</p>
          </div>
          <div className="divide-y divide-slate-200">
            {items.map((item) => (
              <article key={item.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center md:px-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{item.productName}</p>
                  <p className="mt-1 text-xs text-slate-500">รหัสสินค้า {item.productId} · รายการสต๊อก {item.stockItemId || '—'}</p>
                </div>
                <p className="text-sm font-semibold text-slate-700">{item.quantity} ชิ้น</p>
                <p className="text-lg font-semibold text-emerald-800">{formatMoney(Number(item.price) * Number(item.quantity))}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4 md:px-5">
            <h2 className="text-lg font-semibold text-slate-950">ประวัติสถานะใบจอง</h2>
            <p className="mt-1 text-sm text-slate-500">เหตุการณ์ที่ได้รับการบันทึกจากระบบ</p>
          </div>
          {timeline.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-slate-500">ยังไม่มีประวัติการเปลี่ยนสถานะ</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {timeline.map((event) => (
                <article key={event.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center md:px-5">
                  <div>
                    <p className="font-semibold text-slate-950">{COMMAND_LABELS[event.commandType] || event.commandType}</p>
                    <p className="mt-1 text-sm text-slate-600">{event.fromStatus || 'เริ่มต้น'} → {event.toStatus}</p>
                    {event.reason ? <p className="mt-1 text-sm font-semibold text-rose-700">เหตุผล: {event.reason}</p> : null}
                  </div>
                  <div className="text-xs text-slate-500 md:text-right">
                    <p>{formatDateTime(event.occurredAt || event.createdAt)}</p>
                    <p className="mt-1">ผู้ดำเนินการ #{event.actorId || 'ระบบ'}</p>
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