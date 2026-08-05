import React from 'react';
import { Archive, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ProductReservationInboxPage from './ProductReservationInboxPage';

const OnlineCommerceWorkCenterPage = () => {
  const { shopSlug } = useParams();
  const posPrefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return (
    <main className="min-h-full bg-slate-50">
      <section className="mx-auto max-w-7xl px-3 pt-4 md:px-6 md:pt-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-white text-teal-800">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-slate-950">ศูนย์งานขายออนไลน์</h1>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  จัดการใบจองสินค้าออนไลน์ของร้านปัจจุบัน และเปิดงานจากระบบคำสั่งซื้อเดิมเมื่อต้องอ้างอิงข้อมูลย้อนหลัง
                </p>
              </div>
            </div>

            <Link
              to={`${posPrefix}/sales/order-online/legacy`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 text-sm font-semibold text-teal-800 hover:bg-teal-100"
            >
              <Archive className="h-4 w-4" />
              เปิดคำสั่งซื้อระบบเดิม
            </Link>
          </div>
        </div>
      </section>

      <ProductReservationInboxPage />
    </main>
  );
};

export default OnlineCommerceWorkCenterPage;
