import React from 'react';
import { BadgeCheck, Barcode, Clock3, Laptop, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../utils/repairRuntime';

const getAssetIdentity = (asset) =>
  asset?.stockItem || asset?.identity || asset;

const getProduct = (asset) => getAssetIdentity(asset)?.product || asset?.product || {};

const getWarranty = (asset) => asset?.warranty || getAssetIdentity(asset)?.warranty || {};

const CustomerWarrantyAssets = ({ customer, assets, loading, selectedStockItemId, onSelectAsset, onRefresh }) => {
  if (!customer) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Warranty Assets</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">สินค้าที่มีประกันของลูกค้า</h2>
          <p className="mt-1 text-xs text-slate-500">
            แสดงเฉพาะสินค้าที่มี Warranty Policy เพื่อรองรับงานซ่อมและกระบวนการเคลม
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="min-h-10 rounded-xl border border-slate-300 px-4 text-sm font-black text-slate-700 disabled:opacity-50"
        >
          {loading ? 'กำลังโหลด' : 'โหลดใหม่'}
        </button>
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
          กำลังโหลดรายการสินค้าที่มีประกัน...
        </div>
      ) : assets.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center">
          <ShieldCheck className="mx-auto h-7 w-7 text-slate-400" />
          <p className="mt-2 font-black text-slate-700">ไม่พบสินค้าที่มีประกัน</p>
          <p className="mt-1 text-xs text-slate-500">สินค้าที่ไม่มีประกันจะไม่ถูกนำมาแสดงในรายการนี้</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {assets.map((asset) => {
            const identity = getAssetIdentity(asset);
            const product = getProduct(asset);
            const warranty = getWarranty(asset);
            const stockItemId = identity?.id || asset?.stockItemId;
            const selected = String(selectedStockItemId || '') === String(stockItemId || '');

            return (
              <button
                type="button"
                key={stockItemId || asset?.id || `${identity?.barcode}-${identity?.serialNumber}`}
                onClick={() => onSelectAsset(asset)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">{product?.name || identity?.model || 'อุปกรณ์'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {[product?.brand, product?.model].filter(Boolean).join(' · ') || 'ไม่ระบุยี่ห้อ/รุ่น'}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800">
                    มีประกัน
                  </span>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Barcode className="h-4 w-4" /> {identity?.barcode || 'ไม่มีบาร์โค้ด'}
                  </p>
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <BadgeCheck className="h-4 w-4" /> SN: {identity?.serialNumber || 'ไม่มี Serial'}
                  </p>
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-600 sm:col-span-2">
                    <Clock3 className="h-4 w-4" /> ประกันถึง: {formatDateTime(warranty?.expiresAt || asset?.warrantyExpiresAt)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CustomerWarrantyAssets;
