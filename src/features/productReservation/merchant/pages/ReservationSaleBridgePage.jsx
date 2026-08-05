import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import CreateSalePage from '@/features/sales/create/pages/CreateSalePage';
import { createProductReservationSaleCart } from '../adapters/productReservationSaleCartAdapter';
import {
  ensureMerchantProductReservationAllocation,
  getMerchantProductReservation,
} from '../api/productReservationMerchantApi';

const ALLOWED_BRIDGE_STATUSES = new Set(['ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP']);

const ReservationSaleBridgePage = () => {
  const { reservationId, shopSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reservationPath = `/${shopSlug || 'advancetech'}/pos/sales/reservations/${reservationId}`;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const loadBridgeAuthority = async () => {
      const initial = await getMerchantProductReservation(reservationId);
      const nextReservation = initial?.reservation || null;
      if (!nextReservation) throw new Error('ไม่พบใบจองที่ต้องการนำเข้าสู่หน้าขาย');
      if (!ALLOWED_BRIDGE_STATUSES.has(nextReservation.status)) {
        throw new Error(`ใบจองสถานะ ${nextReservation.status} ยังไม่สามารถนำเข้าสู่หน้าขายได้`);
      }

      await ensureMerchantProductReservationAllocation(reservationId);
      return getMerchantProductReservation(reservationId);
    };

    loadBridgeAuthority()
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              'ไม่สามารถเปิดใบจองในหน้าขายได้'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reservationId]);

  const saleCart = useMemo(() => {
    if (!data) return null;
    try {
      return createProductReservationSaleCart(data);
    } catch (mappingError) {
      return { error: mappingError?.message || 'ไม่สามารถแปลงรายการใบจองเป็นตะกร้าขายได้' };
    }
  }, [data]);

  const reservation = data?.reservation;
  const bridgeError = error || saleCart?.error;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-teal-700" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">กำลังเตรียมใบจองสำหรับหน้าขาย</h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            ระบบกำลังผูกสินค้าจริงและตรวจสอบสิทธิ์ของร้านก่อนเปิดรายการขาย
          </p>
        </div>
      </div>
    );
  }

  if (bridgeError || !reservation || !saleCart?.source) {
    return (
      <div className="mx-auto min-h-[50vh] w-full max-w-3xl p-4 md:p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <h1 className="text-lg font-semibold text-rose-900">ไม่สามารถเปิดใบจองในหน้าขายได้</h1>
          <p className="mt-2 text-sm leading-6 text-rose-800">
            {bridgeError || 'ไม่พบใบจอง'}
          </p>
        </div>
        <Link
          to={reservationPath}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 transition hover:bg-teal-100"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปยังใบจอง
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section className="mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-[1600px] rounded-2xl border border-teal-200 bg-teal-50 px-4 py-4 md:w-[calc(100%-2.5rem)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-teal-800">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p className="text-sm font-semibold">ขายสินค้าจากใบจองออนไลน์</p>
            </div>
            <h1 className="mt-2 text-xl font-semibold text-slate-950">
              ใบจอง {reservation.code}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {saleCart.lines.length} รายการ · ผูกสินค้าจริงแล้ว · ไม่สร้าง POS Held Cart หรือใบจองซ้ำ
            </p>
            <p className="mt-1 text-xs text-slate-500">
              อ้างอิงใบจอง #{reservation.id} รายการสินค้าและจำนวนถูกล็อกตามข้อมูลที่ร้านยืนยันไว้
            </p>
          </div>
          <Link
            to={`/${shopSlug || 'advancetech'}/pos/sales/reservations/${reservation.id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-300 bg-white px-4 py-2 text-sm font-semibold text-teal-900 transition hover:bg-teal-100"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับใบจอง
          </Link>
        </div>
      </section>

      <CreateSalePage
        initialItems={saleCart.lines}
        sourceContext={saleCart.source}
        sourceLocked
        saleExecutionDisabled
      />
    </div>
  );
};

export default ReservationSaleBridgePage;
