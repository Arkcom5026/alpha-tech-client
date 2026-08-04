import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import CreateSalePage from '@/features/sales/create/pages/CreateSalePage';
import { getMerchantProductReservation } from '../api/productReservationMerchantApi';

const ALLOWED_BRIDGE_STATUSES = new Set(['ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP']);

const ReservationSaleBridgePage = () => {
  const { reservationId, shopSlug } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getMerchantProductReservation(reservationId)
      .then((result) => {
        if (!active) return;
        const nextReservation = result?.reservation || null;
        if (!nextReservation) throw new Error('ไม่พบใบจองที่ต้องการนำเข้าสู่หน้าขาย');
        if (!ALLOWED_BRIDGE_STATUSES.has(nextReservation.status)) {
          throw new Error(`ใบจองสถานะ ${nextReservation.status} ยังไม่สามารถนำเข้าสู่หน้าขายได้`);
        }
        setReservation(nextReservation);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถเปิดใบจองในหน้าขายได้');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reservationId]);

  if (loading) {
    return <div className="p-10 text-center text-sm font-black text-slate-500">กำลังตรวจสอบใบจองก่อนเข้าสู่หน้าขาย POS...</div>;
  }

  if (error || !reservation) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-700">
          {error || 'ไม่พบใบจอง'}
        </div>
        <Link
          to={`/${shopSlug || 'advancetech'}/pos/sales/reservations/${reservationId}`}
          className="mt-4 inline-flex text-sm font-black text-blue-700"
        >
          ← กลับใบจอง
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section className="mx-auto mt-3 max-w-[1600px] rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">ProductReservation → POS Sale Bridge</p>
            <p className="mt-1 font-black">กำลังขายจากใบจอง {reservation.code}</p>
            <p className="mt-1 text-xs font-bold text-blue-700">
              Source Reservation #{reservation.id} · สถานะ {reservation.status} · POS Sales Engine เดิมเป็นผู้รับชำระและสร้าง Sale
            </p>
          </div>
          <Link
            to={`/${shopSlug || 'advancetech'}/pos/sales/reservations/${reservation.id}`}
            className="inline-flex rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-black text-blue-700 hover:bg-blue-100"
          >
            กลับใบจอง
          </Link>
        </div>
      </section>

      <CreateSalePage />
    </div>
  );
};

export default ReservationSaleBridgePage;
