import React from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductReservationInboxPage from './ProductReservationInboxPage';

const OnlineCommerceWorkCenterPage = () => {
  const { shopSlug } = useParams();
  const posPrefix = shopSlug ? `/${shopSlug}/pos` : '/pos';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pt-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">Online Commerce Work Center</p>
          <p className="mt-1 text-sm text-slate-600">
            ใบจองสินค้าเป็นงานหลัก ส่วนคำสั่งซื้อระบบเดิมถูกแยกไว้เพื่อการอ้างอิงและดำเนินงานต่อเนื่อง
          </p>
        </div>
        <Link
          to={`${posPrefix}/sales/order-online/legacy`}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"
        >
          เปิดคำสั่งซื้อระบบเดิม
        </Link>
      </div>
      <ProductReservationInboxPage />
    </div>
  );
};

export default OnlineCommerceWorkCenterPage;
