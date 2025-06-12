// src/pages/pos/barcode/PreviewBarcodePage.jsx

import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import BarcodeWithQRRenderer from '@/components/shared/barcode/BarcodeWithQRRenderer';

const PreviewBarcodePage = () => {
  const { receiptId } = useParams();
  const { barcodes, loadBarcodesAction } = useBarcodeStore();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [columns, setColumns] = useState(6);
  const [barcodeHeight, setBarcodeHeight] = useState(30);
  const [barcodeWidth, setBarcodeWidth] = useState(2);

  const handleLoadBarcodes = useCallback(async () => {
    if (!receiptId || loading || loaded) return;

    setLoading(true);
    await loadBarcodesAction(receiptId);
    setLoading(false);
    setLoaded(true);

        
  }, [receiptId, loading, loaded, loadBarcodesAction]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold print:hidden">พรีวิวบาร์โค้ด</h1>

      <div className="flex gap-4 items-center print:hidden">
        <button
          onClick={handleLoadBarcodes}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? 'กำลังโหลด...' : 'แสดงบาร์โค้ด'}
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={!loaded || barcodes.length === 0}
        >
          พิมพ์บาร์โค้ด
        </button>

        <label className="flex items-center gap-2">
          ความสูง:
          <input
            type="number"
            value={barcodeHeight}
            onChange={(e) => setBarcodeHeight(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2">
          ความกว้างเส้น:
          <input
            type="number"
            value={barcodeWidth}
            onChange={(e) => setBarcodeWidth(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1"
            min={0.5}
            max={10}
            step={0.1}
          />
        </label>

        <label className="flex items-center gap-2">
          คอลัมน์:
          <input
            type="number"
            value={columns}
            onChange={(e) => setColumns(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1"
          />
        </label>
      </div>

      {!loaded ? (
        <p className="text-gray-500 mt-4 print:hidden">กรุณากดปุ่ม "แสดงบาร์โค้ด" เพื่อโหลดข้อมูล</p>
      ) : barcodes.length === 0 ? (
        <p className="text-red-500 mt-4 print:hidden">ไม่พบบาร์โค้ดจากใบรับสินค้านี้</p>
      ) : (
        <div
          className="grid gap-4 mt-6 print-area"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {barcodes.map((item) => {
            const product = item?.product;
            return (
              <div
                key={item.barcode || item.id}
                className="border p-2 rounded-xl shadow text-center"
              >
                <BarcodeWithQRRenderer
                  barcodeValue={item.barcode}
                  qrValue={item.barcode}
                  productName={product?.title || 'ชื่อสินค้าไม่พบ'}
                  barcodeHeight={barcodeHeight}
                  barcodeWidth={barcodeWidth}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PreviewBarcodePage;