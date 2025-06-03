// ✅ PreviewBarcodePage.jsx — หน้าตัวอย่างก่อนพิมพ์บาร์โค้ด (Debug Edition)

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import BarcodeRenderer from '@/components/shared/barcode/BarcodeRenderer';
import { Button } from '@/components/ui/button';
import { assignSNToReceiptItems } from '@/utils/generateSN';

const PreviewBarcodePage = () => {
  const { receiptId } = useParams();
  const {
    receiptItems,
    loadReceiptItemsByReceiptId,
  } = usePurchaseOrderReceiptStore();

  const [barcodeHeight, setBarcodeHeight] = useState(30);
  const [barcodeWidth, setBarcodeWidth] = useState(1.3);
  const [columnCount, setColumnCount] = useState(3);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    console.log("🌀 useEffect: receiptId =", receiptId);
    if (receiptId) {
      loadReceiptItemsByReceiptId(Number(receiptId)).then(() => {
        console.log("✅ Loaded receiptItems:", receiptItems);
        setRefreshKey((prev) => prev + 1);
      });
    }
  }, [receiptId]);

  useEffect(() => {
    const pageWidth = 800;
    const estimatedBarcodeWidth = barcodeWidth * 100;
    const maxCols = Math.floor(pageWidth / estimatedBarcodeWidth);
    const cols = Math.max(1, Math.min(maxCols, 6));
    console.log("📐 Calculated columns:", cols);
    setColumnCount(cols);
  }, [barcodeWidth]);

  const handlePrint = () => {
    console.log("🖨️ Trigger print window");
    window.print();
  };

  // ✅ ไม่กรอง generatedSNs เพราะต้องการ "สร้าง SN" ที่นี่
  const generatedSNList = assignSNToReceiptItems(receiptItems || [])
    .filter(item => item.quantity > 0)
    .flatMap((item, i) => {
      console.log("🎯 [SN Assignment] Item:", item);
      return item.generatedSNs.map((sn, idx) => {
        console.log("🔢 [Render Barcode] SN =", sn);
        return { id: `${item.id}-${idx}`, sn };
      });
    });

  console.log("📦 Final generatedSNList:", generatedSNList);

  return (
    <div className="p-6 print:p-2" key={refreshKey}>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <h1 className="text-xl font-bold">ตัวอย่างก่อนพิมพ์บาร์โค้ด</h1>
        <Button onClick={handlePrint}>พิมพ์ทั้งหมด</Button>
      </div>

      <div className="mb-4 flex gap-6 items-center text-sm print:hidden">
        <div>
          ความสูง (px):{' '}
          <input
            type="number"
            min="10"
            value={barcodeHeight}
            onChange={(e) => {
              console.log("📏 Updated height:", e.target.value);
              setBarcodeHeight(Number(e.target.value));
            }}
            className="border px-2 py-1 w-20 rounded text-sm"
          />
        </div>
        <div>
          ความกว้าง (px):{' '}
          <input
            type="number"
            min="0.5"
            step="0.1"
            value={barcodeWidth}
            onChange={(e) => {
              console.log("📏 Updated width:", e.target.value);
              setBarcodeWidth(Number(e.target.value));
            }}
            className="border px-2 py-1 w-20 rounded text-sm"
          />
        </div>
        <div className="ml-8 text-gray-500 text-xs">*จำนวนคอลัมน์จะคำนวณอัตโนมัติ</div>
      </div>

      <div
        className={`grid gap-6 print:grid-cols-${columnCount}`}
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {generatedSNList.map((sn) => (
          <div
            key={sn.id || sn.sn}
            className="border rounded p-2 flex flex-col items-center text-xs bg-white shadow print:shadow-none"
          >
            <BarcodeRenderer
              value={sn.sn}
              height={barcodeHeight}
              width={barcodeWidth}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewBarcodePage;
