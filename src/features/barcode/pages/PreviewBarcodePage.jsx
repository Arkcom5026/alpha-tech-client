// src/pages/pos/barcode/PreviewBarcodePage.jsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import BarcodeWithQRRenderer from '@/components/shared/barcode/BarcodeWithQRRenderer';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

const PreviewBarcodePage = () => {
  const { receiptId } = useParams();
  const { barcodes, loadBarcodesAction, markBarcodeAsPrintedAction } = useBarcodeStore();
  const { markReceiptAsPrintedAction } = usePurchaseOrderReceiptStore();

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ปรับลดความสูงเริ่มต้นของบาร์โค้ดเพิ่มเติม
  const [barcodeHeight, setBarcodeHeight] = useState(16);
  const [barcodeWidth, setBarcodeWidth] = useState(0.8);
  const [columns, setColumns] = useState(10);

  const [showBarcode, setShowBarcode] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // โหลดข้อมูลอัตโนมัติครั้งแรก และกันกดซ้ำ
  const handleLoadBarcodes = useCallback(async () => {
    if (!receiptId || loading || loaded) return; // กัน double click/โหลดซ้ำ
    setLoading(true);
    try {
      await loadBarcodesAction(receiptId);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [receiptId, loading, loaded, loadBarcodesAction]);

  useEffect(() => {
    if (!loaded && !loading && receiptId) {
      handleLoadBarcodes();
    }
  }, [receiptId, loaded, loading, handleLoadBarcodes]);

  // ปุ่มพิมพ์: พิมพ์อย่างเดียว
  const handlePrint = async () => {
    if (!loaded || barcodes.length === 0) return;
    window.print();
  };

  // ปุ่มยืนยันพิมพ์แล้ว: ค่อย mark printed
  const handleConfirmPrinted = async () => {
    try {
      if (!receiptId || barcodes.length === 0) return;
      const hasUnprinted = barcodes.some((b) => !b.printed);
      if (hasUnprinted) {
        await markBarcodeAsPrintedAction({ purchaseOrderReceiptId: receiptId });
      }
      await markReceiptAsPrintedAction(receiptId);
    } catch (error) {
      console.error('❌ อัปเดตสถานะ printed ล้มเหลว:', error);
    }
  };

  const gridStyle = useMemo(() => ({
    gridTemplateColumns: `repeat(${columns}, auto)`
  }), [columns]);

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .print-area { padding: 0; margin: 0; }
          .print-area .shadow, .print-area .border, .print-area .rounded-xl { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          .print-area .p-1 { padding: 0 !important; }
          .print-area .barcode-cell { margin-bottom: 0.1mm !important; padding: 0.5mm !important; border: 1px solid #ccc !important; }
          @page { margin: 4mm; size: A4; }
          header, footer, nav, .print-hidden { display: none !important; }
        }
      `}</style>

      <div className="p-6 space-y-6">
        <h1 className="text-xl font-bold print:hidden">พรีวิวบาร์โค้ด</h1>
        <div className='flex justify-center'>
          <div className="flex gap-4 items-center flex-wrap print:hidden">
            <label className="flex items-center gap-1">
              ความสูง:
              <input
                type="number"
                value={barcodeHeight}
                onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1"
                min={10}
                max={60}
                step={1}
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
                min={1}
                max={12}
                step={1}
              />
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showBarcode} onChange={(e) => setShowBarcode(e.target.checked)} />
              แสดง Barcode
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />
              แสดง QR Code
            </label>

            <button
              onClick={handleLoadBarcodes}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'กำลังโหลด...' : (loaded ? 'โหลดอีกครั้ง' : 'แสดงบาร์โค้ด')}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!loaded || barcodes.length === 0}
            >
              พิมพ์บาร์โค้ด
            </button>

            <button
              onClick={handleConfirmPrinted}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              disabled={!loaded || barcodes.length === 0}
            >
              ยืนยันพิมพ์แล้ว
            </button>
          </div>
        </div>
        <hr />

        {!loaded ? (
          <p className="text-gray-500 mt-4 print:hidden">กำลังเตรียมข้อมูลบาร์โค้ด...</p>
        ) : barcodes.length === 0 ? (
          <p className="text-red-500 mt-4 print:hidden">ไม่พบบาร์โค้ดจากใบรับสินค้านี้</p>
        ) : (
          <div className="grid gap-y-[0.1mm] gap-x-1 mt-4 print-area justify-center" style={gridStyle}>
            {barcodes.map((item) => {
              const product = item?.product;
              return (
                <div
                  key={item.barcode || item.id}
                  className="barcode-cell border p-0.5 rounded text-center flex flex-col items-center justify-center"
                >
                  <BarcodeWithQRRenderer
                    barcodeValue={showBarcode ? item.barcode : null}
                    qrValue={showQR ? item.barcode : null}
                    productName={product?.name || 'ชื่อสินค้าไม่พบ'}
                    barcodeHeight={barcodeHeight}
                    barcodeWidth={barcodeWidth}
                    fontSize={5}
                    marginTopText={-7}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default PreviewBarcodePage;
