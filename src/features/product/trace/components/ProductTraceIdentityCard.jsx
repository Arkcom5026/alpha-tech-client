import React from 'react';
import {
  formatProductTraceDateTime,
  resolveProductTraceProductName,
} from '../utils/productTraceFormat';
import { getProductTraceStatusMeta } from '../utils/productTraceStatus';

const Field = ({ label, value }) => (
  <div>
    <div className="text-xs font-medium text-slate-500">{label}</div>
    <div className="mt-1 break-words text-sm font-bold text-slate-950">
      {value ?? '-'}
    </div>
  </div>
);

const ProductTraceIdentityCard = ({ identity, query }) => {
  if (!identity) return null;

  const statusMeta = getProductTraceStatusMeta(identity.status);
  const coverImage =
    identity?.product?.images?.find((image) => image?.isCover)?.url ||
    identity?.product?.images?.[0]?.url ||
    null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {coverImage ? (
            <img
              src={coverImage}
              alt={resolveProductTraceProductName(identity)}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-xs font-semibold text-slate-400">ไม่มีรูปสินค้า</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Product Digital Passport
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">
                {resolveProductTraceProductName(identity)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {identity?.product?.brand?.name || '-'} ·{' '}
                {identity?.product?.productType?.name || '-'}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Field label="บาร์โค้ด" value={identity.barcode} />
            <Field label="Serial Number" value={identity.serialNumber} />
            <Field label="IMEI / รหัสอุปกรณ์" value={identity.imei || identity.deviceId} />
            <Field label="Lot / Batch" value={identity.lotCode || identity.batchCode} />
            <Field label="ตำแหน่งจัดเก็บ" value={identity.locationCode} />
            <Field label="สถานะวงจรชีวิต" value={identity.lifecycleStage} />
            <Field label="ผู้ครอบครองปัจจุบัน" value={identity.currentCustody} />
            <Field label="รับเข้าระบบ" value={formatProductTraceDateTime(identity.receivedAt)} />
            <Field label="ค้นพบจาก" value={query?.matchedBy || '-'} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductTraceIdentityCard;
