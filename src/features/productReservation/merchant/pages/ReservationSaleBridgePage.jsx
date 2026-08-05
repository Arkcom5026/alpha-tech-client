import React, { useEffect, useMemo, useState } from 'react';
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
    return <div className="p-10 text-center text-sm font-black text-slate-500">กำลังผูกสินค้าจริงและตรวจสอบใบจองก่อนเข้าสู่หน้าขาย POS...</div>;
  }

  if (bridgeError || !reservation || !saleCart?.source) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-700">
          {bridgeError || 'ไม่พบใบจอง'}
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
              Source Reservation #{reservation.id} · {saleCart.lines.length} รายการ · ผูกสินค้าจริงแล้ว · ไม่สร้าง POS Held Cart หรือใบจองซ้ำ
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
