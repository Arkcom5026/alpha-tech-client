import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMerchantProductReservation } from '../api/productReservationMerchantApi';

const formatMoney = (value) =>
  new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 }).format(Number(value || 0));

const ProductReservationDetailPage = () => {
  const { reservationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMerchantProductReservation(reservationId)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || requestError?.message || 'ไม่สามารถโหลดใบจองได้');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reservationId]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">กำลังโหลดรายละเอียดใบจอง...</div>;
  if (error || !data?.reservation) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 font-bold text-rose-700">{error || 'ไม่พบใบจอง'}</div>
      </div>
    );
  }

  const { reservation, items = [] } = data;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link to="/pos/sales/reservations" className="text-sm font-black text-blue-700">← กลับรายการใบจอง</Link>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Product Reservation</p>
              <h1 className="mt-2 text-2xl font-black text-slate-950">{reservation.code}</h1>
              <p className="mt-1 text-sm text-slate-500">สถานะ {reservation.status}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-5 py-4 text-right">
              <p className="text-xs font-bold text-amber-700">ยอดจอง</p>
              <p className="text-2xl font-black text-slate-950">{formatMoney(reservation.totalAmount)}</p>
            </div>
          </div>
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
                  <p className="mt-1 text-xs text-slate-500">Product ID {item.productId}</p>
                </div>
                <p className="font-bold text-slate-700">{item.quantity} ชิ้น</p>
                <p className="font-black text-slate-950">{formatMoney(Number(item.price) * Number(item.quantity))}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
          Increment 1 เปิดอ่านข้อมูลจริงของใบจองแล้ว การรับใบจองและเปลี่ยนสถานะจะดำเนินการใน Increment 2
        </section>
      </div>
    </main>
  );
};

export default ProductReservationDetailPage;
