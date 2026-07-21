import React from 'react';
import { formatProductTraceDateTime } from '../utils/productTraceFormat';

const STEP_DEFINITIONS = [
  {
    key: 'RECEIVED',
    label: 'รับเข้า',
    categories: ['PROCUREMENT', 'INVENTORY'],
    types: ['PRODUCT_RECEIVED', 'STOCK_ITEM_RECEIVED', 'RECEIVED'],
  },
  {
    key: 'READY',
    label: 'พร้อมขาย',
    categories: ['INVENTORY'],
    types: ['PRODUCT_READY_TO_SELL', 'READY_TO_SELL', 'STOCK_ITEM_ACTIVATED'],
  },
  {
    key: 'SOLD',
    label: 'ขาย',
    categories: ['SALES'],
    types: ['PRODUCT_SOLD', 'SOLD'],
  },
  {
    key: 'CUSTOMER',
    label: 'ถึงลูกค้า',
    categories: ['SALES'],
    types: ['CUSTOMER_CUSTODY', 'PRODUCT_DELIVERED', 'SALE_COMPLETED'],
  },
  {
    key: 'RETURNED',
    label: 'คืน',
    categories: ['RETURN'],
    types: ['PRODUCT_RETURNED', 'RETURNED', 'PRODUCT_REFUNDED'],
  },
  {
    key: 'CLAIMED',
    label: 'เคลม',
    categories: ['CLAIM'],
    types: ['PRODUCT_CLAIM_CREATED', 'CLAIM_CREATED', 'CLAIMED'],
  },
  {
    key: 'REPAIRED',
    label: 'ซ่อม',
    categories: ['REPAIR'],
    types: ['PRODUCT_REPAIR_RECEIVED', 'PRODUCT_REPAIR_COMPLETED', 'REPAIR'],
  },
];

const normalize = (value) => String(value || '').trim().toUpperCase();

const findEventForStep = (timeline, definition) =>
  timeline.find((event) => {
    const category = normalize(event?.category);
    const type = normalize(event?.type);
    return (
      definition.categories.includes(category) ||
      definition.types.includes(type)
    );
  }) || null;

const ProductTraceJourney = ({ timeline = [], identity }) => {
  const steps = STEP_DEFINITIONS.map((definition) => ({
    ...definition,
    event: findEventForStep(timeline, definition),
  }));

  const soldIndex = steps.findIndex((step) => step.key === 'SOLD');
  const customerIndex = steps.findIndex((step) => step.key === 'CUSTOMER');

  if (
    identity?.currentCustody === 'CUSTOMER' &&
    soldIndex >= 0 &&
    customerIndex >= 0 &&
    !steps[customerIndex].event
  ) {
    steps[customerIndex] = {
      ...steps[customerIndex],
      event: steps[soldIndex].event || {
        occurredAt: null,
      },
    };
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-black text-slate-950">เส้นทางชีวิตสินค้า</h3>
        <p className="mt-1 text-xs text-slate-500">
          มองภาพรวมตั้งแต่รับเข้า จนถึงสถานะหลังการขาย
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        {steps.map((step, index) => {
          const completed = Boolean(step.event);

          return (
            <div key={step.key} className="relative">
              {index < steps.length - 1 ? (
                <div className="absolute left-[calc(50%+24px)] top-5 hidden h-px w-[calc(100%-48px)] bg-slate-200 xl:block" />
              ) : null}

              <div
                className={[
                  'relative rounded-2xl border p-4 text-center',
                  completed
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200 bg-slate-50',
                ].join(' ')}
              >
                <div
                  className={[
                    'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-black',
                    completed
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500',
                  ].join(' ')}
                >
                  {completed ? '✓' : index + 1}
                </div>
                <div className="mt-3 text-sm font-black text-slate-900">
                  {step.label}
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {completed
                    ? formatProductTraceDateTime(step.event?.occurredAt, 'สำเร็จแล้ว')
                    : 'ยังไม่มีเหตุการณ์'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductTraceJourney;
