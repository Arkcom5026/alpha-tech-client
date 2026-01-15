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

  // ✅ ขนาดบาร์โค้ด (ปรับได้)
  const [barcodeHeight, setBarcodeHeight] = useState(16);
  const [barcodeWidth, setBarcodeWidth] = useState(1.1);

  // ✅ จำนวนคอลัมน์ (โหมด grid เท่านั้น)
  const [columns, setColumns] = useState(10);

  // ✅ โหมดรูปแบบการพิมพ์
  // - grid: แบบเดิมหลายคอลัมน์
  // - list: แบบตัวอย่างมาตรฐาน (เรียงแนวตั้ง 1 คอลัมน์ ชิด ๆ)
  const [printLayout, setPrintLayout] = useState('grid');

  // ✅ ความสูงอัตโนมัติสำหรับโหมด LIST (ต้องประกาศหลัง printLayout)
  const effectiveBarcodeHeight = useMemo(
    () => (printLayout === 'list' ? 40 : barcodeHeight),
    [printLayout, barcodeHeight]
  );

  const [showBarcode, setShowBarcode] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // ใช้ helper จาก store เพื่อขยายจำนวนดวงของ LOT ตาม qtyLabelsSuggested
  const getExpandedBarcodesForPrint = useBarcodeStore((s) => s.getExpandedBarcodesForPrint);
  const [useSuggested, setUseSuggested] = useState(true);
  const expandedBarcodes = useMemo(
    () => getExpandedBarcodesForPrint(useSuggested),
    // NOTE: barcodes ใส่ไว้เพื่อ force re-memo เมื่อโหลดชุดใหม่
    [getExpandedBarcodesForPrint, useSuggested, barcodes]
  );

  // โหลดข้อมูลอัตโนมัติครั้งแรก และกันกดซ้ำ
  const handleLoadBarcodes = useCallback(async () => {
    if (!receiptId || loading || loaded) return;
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

  const handlePrint = () => {
    if (!loaded || barcodes.length === 0) return;
    window.print();
  };

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

  const gridStyle = useMemo(() => {
    const colCount = printLayout === 'list' ? 1 : columns;
    return {
      gridTemplateColumns: `repeat(${colCount}, auto)`,
      justifyContent: printLayout === 'list' ? 'flex-start' : 'center',
    };
  }, [columns, printLayout]);

  return (
    <>
      <style>{`
        /* ✅ Code39 Font: วางไฟล์ฟอนต์ไว้ที่ /public/fonts/C39HrP24DhTt.ttf */
        @font-face {
          font-family: 'C39HrP24DhTt';
          src: url('/fonts/C39HrP24DhTt.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        /* ✅ เพิ่ม letter-spacing ให้เหมือนฉลากมาตรฐาน */
        .c39-font {
          font-family: 'C39HrP24DhTt', monospace;
          /* ✅ ขยายระยะห่างตัวอักษรให้ใกล้มาตรฐานฉลาก */
          letter-spacing: 8px; /* ขยายระยะตัวเลขให้กว้างขึ้นตามตัวอย่าง */
        }

        @media print {
          body { margin: 0; padding: 0; background: white; }
          .print-area { padding: 0; margin: 0; }
          .print-area .shadow, .print-area .border, .print-area .rounded-xl {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .print-area .p-1 { padding: 0 !important; }

          /* ✅ โหมดเดิม (GRID) */
          .print-area.is-grid .barcode-cell {
            margin-bottom: 0.1mm !important;
            padding: 0.5mm !important;
            border: 1px solid #ccc !important;
          }

          /* ✅ โหมดมาตรฐาน (LIST) แบบตัวอย่าง */
          .print-area.is-list { justify-content: flex-start !important; }
          .print-area.is-list .barcode-cell {
            margin: 0.5mm 0 !important;
            padding: 0 !important;
            border: none !important;
          }

          @page { margin: 4mm; size: A4; }
          header, footer, nav, .print-hidden { display: none !important; }
        }
      `}</style>

      <div className="p-6 space-y-6">
        <h1 className="text-xl font-bold print:hidden">พรีวิวบาร์โค้ด</h1>

        <div className="flex justify-center">
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
                disabled={printLayout === 'list'}
                title={printLayout === 'list' ? 'โหมด LIST บังคับเป็น 1 คอลัมน์' : ''}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={printLayout === 'list'}
                onChange={(e) => setPrintLayout(e.target.checked ? 'list' : 'grid')}
              />
              โหมดพิมพ์แบบยาว (LIST)
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showBarcode} onChange={(e) => setShowBarcode(e.target.checked)} />
              แสดง Barcode
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />
              แสดง QR Code
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={useSuggested} onChange={(e) => setUseSuggested(e.target.checked)} />
              พิมพ์ตามจำนวนรับ (SIMPLE)
            </label>

            <button
              onClick={handleLoadBarcodes}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {loading ? 'กำลังโหลด...' : loaded ? 'โหลดอีกครั้ง' : 'แสดงบาร์โค้ด'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              disabled={!loaded || expandedBarcodes.length === 0}
            >
              พิมพ์บาร์โค้ด
            </button>

            <button
              onClick={handleConfirmPrinted}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              disabled={!loaded || expandedBarcodes.length === 0}
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
          <div
            className={`grid gap-y-[1mm] gap-x-[2mm] mt-4 print-area ${
              printLayout === 'list' ? 'is-list justify-start' : 'is-grid justify-center'
            }`}
            style={gridStyle}
          >
            {expandedBarcodes.map((item) => (
              <div
                key={`${item.id || item.barcode}-${item._dupIdx ?? 0}`}
                className={`barcode-cell ${
                  printLayout === 'list'
                    ? 'text-center flex flex-col items-center justify-center'
                    : 'border p-0.5 rounded text-center flex flex-col items-center justify-center'
                }`}
              >
                {/* ✅ แสดงชนิดบาร์โค้ดเฉพาะ SN เท่านั้น */}
                

                <BarcodeWithQRRenderer
                  barcodeValue={showBarcode ? item.barcode : null}
                  qrValue={item.kind === 'SN' && showQR ? item.barcode : null}
                  productName={printLayout === 'list' ? null : item.productName || 'ชื่อสินค้าไม่พบ'}
                  barcodeHeight={effectiveBarcodeHeight}
                  barcodeWidth={barcodeWidth}
                  fontSize={6}
                  marginTopText={-4}
                  layout={printLayout === 'list' ? 'list-vertical' : 'grid'}
                  barcodeFormat={printLayout === 'list' ? 'CODE39' : undefined}
                  showAsteriskText={printLayout === 'list'}
                  useC39Font={printLayout === 'list'}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PreviewBarcodePage;
