import React from 'react';
import { formatProductTraceDateTime } from '../utils/productTraceFormat';

const Group = ({ title, items, emptyText, renderItem }) => (
  <div>
    <div className="flex items-center justify-between gap-3">
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
        {items.length}
      </span>
    </div>

    {items.length ? (
      <div className="mt-2 space-y-2">{items.map(renderItem)}</div>
    ) : (
      <p className="mt-2 text-sm text-slate-500">{emptyText}</p>
    )}
  </div>
);

const ItemBox = ({ title, subtitle, status, date }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">{title || '-'}</div>
        <div className="mt-1 text-xs text-slate-500">{subtitle || '-'}</div>
      </div>
      <span className="shrink-0 text-xs font-bold text-slate-700">{status || '-'}</span>
    </div>
    <div className="mt-2 text-xs text-slate-500">{formatProductTraceDateTime(date)}</div>
  </div>
);

const ProductTraceAfterSalesCard = ({ returns = [], claims = [], repairs = [] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-base font-bold text-slate-900">หลังการขาย</h3>

    <div className="mt-4 grid gap-5 lg:grid-cols-3">
      <Group
        title="คืนสินค้า / คืนเงิน"
        items={returns}
        emptyText="ไม่พบประวัติการคืนสินค้า"
        renderItem={(item, index) => (
          <ItemBox
            key={item?.returnItemId || item?.id || index}
            title={item?.saleReturn?.code || 'รับคืนสินค้า'}
            subtitle={item?.reason || item?.saleReturn?.reason}
            status={item?.saleReturn?.status}
            date={item?.saleReturn?.returnedAt}
          />
        )}
      />

      <Group
        title="เคลม"
        items={claims}
        emptyText="ไม่พบประวัติการเคลม"
        renderItem={(item, index) => (
          <ItemBox
            key={item?.id || index}
            title={item?.claimNo || 'เคลมสินค้า'}
            subtitle={item?.reason}
            status={item?.status}
            date={item?.createdAt}
          />
        )}
      />

      <Group
        title="งานซ่อม"
        items={repairs}
        emptyText="ไม่พบประวัติการซ่อม"
        renderItem={(item, index) => (
          <ItemBox
            key={item?.id || index}
            title={item?.jobNo || 'งานซ่อม'}
            subtitle={item?.reportedSymptoms}
            status={item?.status}
            date={item?.createdAt}
          />
        )}
      />
    </div>
  </section>
);

export default ProductTraceAfterSalesCard;
