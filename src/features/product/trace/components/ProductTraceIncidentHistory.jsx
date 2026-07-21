import React from 'react';
import { formatProductTraceDateTime } from '../utils/productTraceFormat';

const incidentGroups = [
  {
    key: 'RETURN',
    title: 'คืนสินค้า / คืนเงิน',
    emptyLabel: 'ตรวจแล้ว ไม่เคยคืนสินค้า',
    color: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    key: 'CLAIM',
    title: 'เคลม',
    emptyLabel: 'ตรวจแล้ว ไม่เคยมีประวัติเคลม',
    color: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  {
    key: 'REPAIR',
    title: 'งานซ่อม',
    emptyLabel: 'ตรวจแล้ว ไม่เคยมีประวัติซ่อม',
    color: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  },
  {
    key: 'LOSS_DAMAGE',
    title: 'สูญหาย / ชำรุด / เปลี่ยน',
    emptyLabel: 'ตรวจแล้ว ไม่พบเหตุสูญหายหรือชำรุด',
    color: 'border-rose-200 bg-rose-50 text-rose-700',
  },
];

const IncidentItem = ({ title, subtitle, status, date }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-black text-slate-950">{title || '-'}</div>
        <div className="mt-1 text-xs text-slate-500">{subtitle || '-'}</div>
      </div>
      <span className="shrink-0 text-xs font-black text-slate-700">{status || '-'}</span>
    </div>
    <div className="mt-2 text-xs text-slate-500">{formatProductTraceDateTime(date)}</div>
  </div>
);

const ProductTraceIncidentHistory = ({
  returns = [],
  claims = [],
  repairs = [],
  timeline = [],
}) => {
  const lossDamageEvents = timeline.filter((event) => {
    const type = String(event?.type || '').toUpperCase();
    return ['PRODUCT_LOST', 'PRODUCT_DAMAGED', 'PRODUCT_REPLACED'].includes(type);
  });

  const grouped = {
    RETURN: returns,
    CLAIM: claims,
    REPAIR: repairs,
    LOSS_DAMAGE: lossDamageEvents,
  };

  const total = returns.length + claims.length + repairs.length + lossDamageEvents.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">Incident History</h3>
          <p className="mt-1 text-xs text-slate-500">
            ประวัติเหตุผิดปกติหลังการขายและระหว่างวงจรชีวิตสินค้า
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {total} เหตุการณ์
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-4">
        {incidentGroups.map((group) => {
          const items = grouped[group.key] || [];

          return (
            <div key={group.key} className={`rounded-2xl border p-4 ${group.color}`}>
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-black">{group.title}</h4>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-black">
                  {items.length}
                </span>
              </div>

              {items.length ? (
                <div className="mt-3 space-y-2">
                  {items.map((item, index) => {
                    if (group.key === 'RETURN') {
                      return (
                        <IncidentItem
                          key={item?.returnItemId || item?.id || index}
                          title={item?.saleReturn?.code || 'รับคืนสินค้า'}
                          subtitle={item?.reason || item?.saleReturn?.reason}
                          status={item?.saleReturn?.status}
                          date={item?.saleReturn?.returnedAt}
                        />
                      );
                    }

                    if (group.key === 'CLAIM') {
                      return (
                        <IncidentItem
                          key={item?.id || index}
                          title={item?.claimNo || 'เคลมสินค้า'}
                          subtitle={item?.reason}
                          status={item?.status}
                          date={item?.createdAt}
                        />
                      );
                    }

                    if (group.key === 'REPAIR') {
                      return (
                        <IncidentItem
                          key={item?.id || index}
                          title={item?.jobNo || 'งานซ่อม'}
                          subtitle={item?.reportedSymptoms}
                          status={item?.status}
                          date={item?.createdAt}
                        />
                      );
                    }

                    return (
                      <IncidentItem
                        key={item?.id || index}
                        title={item?.title || item?.type}
                        subtitle={item?.description}
                        status={item?.status}
                        date={item?.occurredAt}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-current/15 bg-white/55 p-3">
                  <div className="text-sm font-black">✓ {group.emptyLabel}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductTraceIncidentHistory;
