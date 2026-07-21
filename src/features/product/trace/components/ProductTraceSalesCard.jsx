import React from 'react';
import {
  formatProductTraceDateTime,
  formatProductTraceMoney,
  resolveProductTraceCustomerName,
} from '../utils/productTraceFormat';

const ProductTraceSalesCard = ({ sales }) => {
  if (!sales?.sale) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">ประวัติการขาย</h3>
        <p className="mt-2 text-sm text-slate-500">สินค้าชิ้นนี้ยังไม่มีประวัติการขาย</p>
      </section>
    );
  }

  const sale = sales.sale;
  const pricing = sales.pricing || {};

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">ประวัติการขาย</h3>
          <p className="mt-1 text-sm text-slate-500">{sale.code || '-'}</p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          {sale.statusPayment || sale.status || '-'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-slate-500">วันที่ขาย</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {formatProductTraceDateTime(sale.soldAt)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">พนักงานขาย</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {sale?.employee?.name || '-'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">ลูกค้า</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {resolveProductTraceCustomerName(sale.customer)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">โทรศัพท์</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {sale?.customer?.phone || sale?.customer?.user?.loginId || '-'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
        <div>
          <div className="text-[11px] text-slate-500">ราคาก่อนลด</div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {formatProductTraceMoney(pricing.basePrice)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">ส่วนลด</div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {formatProductTraceMoney(pricing.discount)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500">ราคาสุทธิ</div>
          <div className="mt-1 text-sm font-bold text-blue-700">
            {formatProductTraceMoney(pricing.netPrice)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductTraceSalesCard;
