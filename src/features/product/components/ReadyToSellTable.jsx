// ✅ FILE: src/features/product/components/ReadyToSellTable.jsx
import React, { useMemo } from 'react';

const safeDateTH = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('th-TH');
};

const normalizeMode = (r) => {
  const m = (r?.mode ?? r?.productMode ?? '').toString().toUpperCase();
  if (m === 'SIMPLE' || m === 'STRUCTURED') return m;

  const k = (r?.kind ?? '').toString().toUpperCase();
  if (k === 'STRUCTURED' || k === 'SN' || k === 'SERIAL') return 'STRUCTURED';
  if (k === 'SIMPLE' || k === 'LOT') return 'SIMPLE';

  const isSimple = r?.simpleLotId != null || r?.lotId != null || r?.isSimple === true;
  if (isSimple) return 'SIMPLE';

  if (r?.serialNumber) return 'STRUCTURED';
  if (r?.stockItemId != null || r?.stockItem?.id != null) return 'STRUCTURED';

  return 'SIMPLE';
};

const ReadyToSellTable = ({ items = [], loading = false, onViewDetails }) => {
  const rows = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const viewRows = useMemo(() => {
    return rows.map((r) => {
      const productId = r?.productId ?? r?.product?.id ?? null;
      const mode = normalizeMode(r);

      const code =
        r?.displayCode ??
        r?.serialNumber ??
        r?.barcode ??
        r?.lotBarcode ??
        r?.sku ??
        '-';

      const name =
        r?.productName ??
        r?.name ??
        r?.product?.name ??
        '-';

      const brand =
        r?.brandName ??
        r?.product?.brandName ??
        (typeof r?.brand === 'string' ? r.brand : r?.brand?.name) ??
        r?.product?.brand?.name ??
        '-';

      const status = r?.status ?? (mode === 'SIMPLE' ? 'ACTIVE' : 'IN_STOCK');
      const receivedAt = safeDateTH(r?.receivedAt);
      const qty = Number(r?.qty ?? 1);

      const key =
        r?.id ??
        r?.stockItemId ??
        r?.simpleLotId ??
        `${mode}-${code}-${name}`;

      return {
        key,
        productId,
        qty,
        mode,
        code,
        name,
        brand,
        status,
        receivedAt,
      };
    });
  }, [rows]);

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="px-4 py-3 border-b bg-white">
        <div className="text-sm font-semibold">รายการสินค้าพร้อมขาย</div>
        <div className="text-xs text-gray-500 mt-1">
          โหมด / รหัส / ชื่อ / แบรนด์ / สถานะ / รับเข้า
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3 whitespace-nowrap">โหมด</th>
              <th className="px-4 py-3 whitespace-nowrap">จำนวน</th>
              <th className="px-4 py-3 whitespace-nowrap">รหัส</th>
              <th className="px-4 py-3 min-w-[320px]">ชื่อสินค้า</th>
              <th className="px-4 py-3 whitespace-nowrap">แบรนด์</th>
              <th className="px-4 py-3 whitespace-nowrap">สถานะ</th>
              <th className="px-4 py-3 whitespace-nowrap">รับเข้า</th>
              <th className="px-4 py-3 whitespace-nowrap text-right">รายละเอียด</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-64 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 w-20 bg-gray-100 rounded ml-auto" /></td>
                </tr>
              ))
            ) : viewRows.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-gray-500" colSpan={8}>
                  ไม่พบสินค้าพร้อมขายในเงื่อนไขนี้
                </td>
              </tr>
            ) : (
              viewRows.map((r) => (
                <tr key={r.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                        r.mode === 'STRUCTURED'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}
                    >
                      {r.mode === 'STRUCTURED' ? 'SN' : 'SIMPLE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center font-medium">{r.qty}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono">{r.code}</td>
                  <td className="px-4 py-3 min-w-[320px]">{r.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.brand}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border bg-gray-50 border-gray-200 text-gray-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.receivedAt}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    {r.mode === 'STRUCTURED' ? (
                      <button
                        type="button"
                        className="inline-flex items-center rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                        onClick={() => {
                          if (typeof onViewDetails === 'function') onViewDetails(r.productId);
                        }}
                        disabled={!r.productId}
                        title="ดูรายการ SN ทั้งหมด"
                      >
                        รายละเอียด
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(ReadyToSellTable);
