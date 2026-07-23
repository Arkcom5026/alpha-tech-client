import React from 'react';
import { formatProductTraceDateTime } from '../utils/productTraceFormat';

const normalize = (value) => String(value || '').trim().toUpperCase();

const isReturnTransitionEvent = (event = {}) => {
  const type = normalize(event.type);
  return type === 'PRODUCT_RETURNED' || (
    type.includes('RETURN') && !type.includes('REFUND')
  );
};

export const buildOwnershipEntries = ({ identity, timeline = [], procurement, sales } = {}) => {
  const entries = [];

  if (procurement?.supplier?.name) {
    entries.push({
      id: 'supplier',
      label: 'Supplier',
      holder: procurement.supplier.name,
      occurredAt:
        procurement?.receipt?.receivedAt ||
        procurement?.receivedAt ||
        identity?.receivedAt ||
        null,
      source: procurement?.purchaseOrder?.code || procurement?.receipt?.code || null,
    });
  }

  if (identity?.receivedAt) {
    entries.push({
      id: 'store',
      label: 'ร้านค้า',
      holder: 'รับเข้าสินค้าเข้าระบบ',
      occurredAt: identity.receivedAt,
      source: null,
    });
  }

  for (const cycle of sales?.cycles || (sales?.sale ? [sales] : [])) {
    const sale = cycle?.sale;
    if (!sale) continue;
    entries.push({
      id: `sale-${sale.id || sale.code || 'customer'}`,
      label: 'ลูกค้า',
      holder:
        sale?.customer?.companyName ||
        sale?.customer?.name ||
        'ลูกค้า',
      occurredAt: sale.soldAt || null,
      source: sale.code || null,
    });
  }

  const returnDocuments = new Set();
  timeline.forEach((event, index) => {
    const type = normalize(event?.type);
    const category = normalize(event?.category);

    if (isReturnTransitionEvent(event)) {
      const returnKey = String(
        event?.document?.id ??
        event?.document?.code ??
        event?.id ??
        index
      );
      if (!returnDocuments.has(returnKey)) {
        returnDocuments.add(returnKey);
        entries.push({
          id: `return-${returnKey}`,
          label: 'ร้านค้า',
          holder: 'รับสินค้าคืน',
          occurredAt: event.occurredAt,
          source: event?.document?.code || null,
        });
      }
    }

    if (category === 'CLAIM' || type.includes('CLAIM')) {
      entries.push({
        id: `claim-${event.id || index}`,
        label: 'ศูนย์เคลม',
        holder: event?.metadata?.supplierName || 'อยู่ระหว่างกระบวนการเคลม',
        occurredAt: event.occurredAt,
        source: event?.document?.code || null,
      });
    }

    if (category === 'REPAIR' || type.includes('REPAIR')) {
      entries.push({
        id: `repair-${event.id || index}`,
        label: 'งานซ่อม',
        holder: event?.actor?.name || 'อยู่ระหว่างงานซ่อม',
        occurredAt: event.occurredAt,
        source: event?.document?.code || null,
      });
    }
  });

  const currentCustody = normalize(identity?.currentCustody);
  const latestSale = sales?.sale;
  const hasCurrentCustomer = entries.some((item) => item.label === 'ลูกค้า');

  if (currentCustody === 'CUSTOMER' && !hasCurrentCustomer) {
    entries.push({
      id: 'current-customer',
      label: 'ลูกค้า',
      holder: 'ผู้ครอบครองปัจจุบัน',
      occurredAt: latestSale?.soldAt || null,
      source: latestSale?.code || null,
    });
  }

  return entries
    .filter((entry) => entry.holder)
    .sort((a, b) => {
      if (!a.occurredAt && !b.occurredAt) return 0;
      if (!a.occurredAt) return 1;
      if (!b.occurredAt) return -1;
      return new Date(a.occurredAt) - new Date(b.occurredAt);
    });
};

const ProductTraceOwnershipHistory = ({
  identity,
  timeline = [],
  procurement,
  sales,
}) => {
  const entries = buildOwnershipEntries({
    identity,
    timeline,
    procurement,
    sales,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-950">Ownership History</h3>
          <p className="mt-1 text-xs text-slate-500">
            ลำดับผู้ครอบครองและจุดที่สินค้าชิ้นนี้เคยอยู่
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {entries.length} จุด
        </span>
      </div>

      {entries.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {entry.label}
                  </div>
                  <div className="mt-1 text-sm font-black text-slate-950">
                    {entry.holder}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {formatProductTraceDateTime(entry.occurredAt)}
                  </div>
                  {entry.source ? (
                    <div className="mt-1 text-[11px] font-semibold text-slate-500">
                      เอกสาร: {entry.source}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
          ยังไม่มีข้อมูลเพียงพอสำหรับสร้างประวัติผู้ครอบครอง
        </div>
      )}
    </section>
  );
};

export default ProductTraceOwnershipHistory;
