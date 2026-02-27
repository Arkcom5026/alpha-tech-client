// src/features/stockItem/components/PendingBarcodeTable.jsx
// ✅ PendingBarcodeTable — รับ props.items และ fallback ไปที่ store
// - แสดงเฉพาะรายการที่ "ยังไม่ถูกยิงเข้าสต๊อก" (pending)
// - ใช้ UI-based status (no dialog)

import React, { useMemo } from 'react';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';

const safeText = (v) => {
  if (v == null) return '';
  return String(v);
};

const normalizeRow = (b) => {
  const stockItem = b?.stockItem || null;
  return {
    id: b?.id ?? null,
    barcode: safeText(b?.barcode),
    serialNumber: safeText(b?.serialNumber || stockItem?.serialNumber),

    // product display (minimal disruption: support multiple shapes)
    productName: safeText(b?.productName || stockItem?.productName || stockItem?.product?.nameTh || stockItem?.product?.name || '-'),
    sku: safeText(stockItem?.product?.sku || stockItem?.sku || ''),

    // hierarchy (optional)
    categoryName: safeText(stockItem?.product?.category?.name || stockItem?.categoryName || ''),
    productTypeName: safeText(stockItem?.product?.productType?.name || stockItem?.productTypeName || ''),
    brandName: safeText(stockItem?.product?.brand?.name || stockItem?.brandName || ''),
    profileName: safeText(stockItem?.product?.profile?.name || stockItem?.profileName || ''),
    templateName: safeText(stockItem?.product?.template?.name || stockItem?.templateName || ''),

    // scan status
    stockItemId: b?.stockItemId ?? stockItem?.id ?? null,
    status: safeText(stockItem?.status || ''),
  };
};

const PendingBarcodeTable = ({ items }) => {
  const { barcodes } = useBarcodeStore();

  // ใช้ props.items ถ้ามี ไม่งั้น fallback ไปที่ store
  const source = Array.isArray(items) ? items : barcodes;

  const rows = useMemo(() => (Array.isArray(source) ? source : []).map(normalizeRow), [source]);

  const isScanned = (r) => r?.stockItemId != null;

  const pendingRows = useMemo(() => rows.filter((r) => !isScanned(r)), [rows]);
  const scannedCount = rows.length - pendingRows.length;

  const showHierarchy = useMemo(
    () => pendingRows.some((r) => r.categoryName || r.productTypeName || r.brandName || r.profileName || r.templateName),
    [pendingRows]
  );

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b bg-white flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">รายการที่ยังไม่ยิงเข้าสต๊อก</div>
        <div className="text-xs text-gray-600">
          ทั้งหมด {rows.length} • ยิงแล้ว {scannedCount} • ค้าง {pendingRows.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">#</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">สินค้า</th>
              {showHierarchy && (
                <th className="px-4 py-2 text-left whitespace-nowrap">หมวด/ประเภท/แบรนด์/โปรไฟล์/เทมเพลต</th>
              )}
              <th className="px-4 py-2 text-left whitespace-nowrap">บาร์โค้ด</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">SN</th>
            </tr>
          </thead>
          <tbody>
            {pendingRows.length === 0 ? (
              <tr>
                <td colSpan={showHierarchy ? 5 : 4} className="text-center p-4 text-green-700">
                  ✅ ยิงครบแล้ว
                </td>
              </tr>
            ) : (
              pendingRows.map((r, index) => (
                <tr
                  key={`${r.barcode}__${r.serialNumber || 'no-sn'}__${r.id || index}`}
                  className="border-t hover:bg-blue-50"
                >
                  <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.productName || '-'}</div>
                    {r.sku ? <div className="text-xs text-gray-500">SKU: {r.sku}</div> : null}
                  </td>
                  {showHierarchy && (
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {[r.categoryName, r.productTypeName, r.brandName, r.profileName, r.templateName]
                        .filter(Boolean)
                        .join(' / ') || '-'}
                    </td>
                  )}
                  <td className="px-4 py-2 font-mono text-blue-700 whitespace-nowrap">{r.barcode || '-'}</td>
                  <td className="px-4 py-2 font-mono whitespace-nowrap">{r.serialNumber || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingBarcodeTable;
