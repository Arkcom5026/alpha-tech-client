
// src/pages/pos/barcode/PreviewBarcodePage.jsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import BarcodeWithQRRenderer from '@/components/shared/barcode/BarcodeWithQRRenderer';
import c39FontUrl from '@/assets/fonts/c39hrp24dhtt.ttf?url';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

const PreviewBarcodePage = () => {
  // ✅ ชื่อสินค้าสำหรับงานพิมพ์ (รองรับ Production)
  // - แสดงได้สูงสุด 2 บรรทัดด้วย CSS line-clamp
  // - มี fallback ตัดตัวอักษรกรณีชื่อเป็นคำยาวติดกันมาก (กันล้น/แกว่ง)
  const getListDisplayName = useCallback((item) => {
    const raw = (item?.productName || '').toString().trim();
    if (!raw) return 'ชื่อสินค้าไม่พบ';

    // กันเคสคำยาวติดกัน/ไม่มีช่องว่าง: ตัดด้วยจำนวนตัวอักษรเพื่อให้ ellipsis ทำงานนิ่ง
    const MAX_CHARS = 90; // ประมาณ 2 บรรทัดที่ font 11px บนหน้ากระดาษ
    if (raw.length <= MAX_CHARS) return raw;

    const sliced = raw.slice(0, MAX_CHARS).trim();
    return `${sliced}…`;
  }, []);

  const { receiptId } = useParams();
  const { barcodes, loadBarcodesAction, markBarcodeAsPrintedAction } = useBarcodeStore();
  const { markReceiptAsPrintedAction } = usePurchaseOrderReceiptStore();

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ✅ ขนาดบาร์โค้ด (ปรับได้)
  const [barcodeHeight, setBarcodeHeight] = useState(30);
  const [barcodeWidth, setBarcodeWidth] = useState(0.8);

  // ✅ LIST (font-only): ปรับความกว้างบาร์โค้ดจาก UI (scaleX)
  // 1.00 = ปกติ, 0.90 = แคบลงเล็กน้อย, 0.80 = แคบชัด
  const [listWidthScale, setListWidthScale] = useState(0.9);

  // ✅ จำนวนคอลัมน์ (โหมด grid เท่านั้น)
  const [columns, setColumns] = useState(10);

  // ✅ โหมดรูปแบบการพิมพ์
  // - grid: แบบเดิมหลายคอลัมน์
  // - list: แบบเรียงแนวตั้ง 1 คอลัมน์ (font-only)
  const [printLayout, setPrintLayout] = useState('grid');

  // ✅ ความสูงบาร์โค้ดที่ใช้จริง (LIST/GRID)
  // หมายเหตุ: โหมด LIST (font-only) จะใช้ scaleY เพื่อ “ลดสูง” โดยไม่ทำให้ “แคบลง”
  const effectiveBarcodeHeight = useMemo(() => barcodeHeight, [barcodeHeight]);

  const [showBarcode, setShowBarcode] = useState(true);
  const [showQR, setShowQR] = useState(false);

  // ✅ วัด “ความกว้างจริงของบาร์โค้ด” แล้วเอาไปล็อกความกว้างของชื่อสินค้าให้เท่ากัน (กันชื่อดันให้กว้างเอง)
  const [measuredBarcodeWidths, setMeasuredBarcodeWidths] = useState({});
  const measureBarcodeWidth = useCallback((key, el) => {
    if (!el) return;
    // ใช้ RAF เพื่อให้ได้ขนาดหลัง layout/transform แล้ว
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(0, Math.round(rect.width));
      setMeasuredBarcodeWidths((prev) => {
        if (prev[key] === w) return prev;
        return { ...prev, [key]: w };
      });
    });
  }, []);

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
        /* ✅ Code39 Font (Vite-safe) */
        @font-face {
          font-family: 'C39HrP24DhTt';
          src: url('${c39FontUrl}') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        /* ✅ ชื่อสินค้า (ใช้ทั้ง LIST/GRID): 2 บรรทัด + ตัด … และ “กว้างเท่าบาร์โค้ด” (กว้างตาม .barcode-block) */
        .barcode-product-name,
        .list-product-name {
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
          font-size: 11px;
          line-height: 1.15;
          letter-spacing: 0.4px;
          margin-bottom: 2px;
          text-align: center;

          /* ✅ clamp ทำงานต้องมี “ความกว้างที่ถูกจำกัดจริง” → เราจะล็อกผ่าน inline style จากการวัดความกว้างบาร์โค้ด */
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;

          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;

          max-height: calc(1.15em * 2);
        }

        /* ✅ กล่องที่ “ล็อกความกว้าง” ให้ยึดตามบาร์โค้ด (shrink-to-fit) */
        .barcode-block {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 100%;
        }

        /* ✅ LIST (font-only): ฟอนต์สำหรับวาดแท่งบาร์ (Code39) */
        .c39-barcode {
          font-family: 'C39HrP24DhTt', monospace !important;
          letter-spacing: 0;
          white-space: nowrap;
        }

        /* ✅ โหมด LIST: ระยะห่าง “ตอนพรีวิวบนจอ” */
        .print-area.is-list .barcode-cell {
          margin: 16px 0;
          padding: 0;
          border: none;
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

          /* ✅ โหมด LIST */
          .print-area.is-list { justify-content: flex-start !important; }
          .print-area.is-list .barcode-cell {
            margin: 4mm 0 !important; /* ระยะห่างแนวตั้งระหว่างบาร์โค้ด */
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
              ความกว้างเส้น (GRID):
              <input
                type="number"
                value={barcodeWidth}
                onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1"
                min={0.5}
                max={10}
                step={0.1}
                disabled={printLayout === 'list'}
                title={printLayout === 'list' ? 'โหมด LIST ใช้ตัวปรับ “ความกว้าง LIST” แทน' : ''}
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

            {printLayout === 'list' ? (
              <label className="flex items-center gap-2">
                ความกว้าง LIST:
                <input
                  type="range"
                  value={listWidthScale}
                  onChange={(e) => setListWidthScale(Number(e.target.value))}
                  className="w-44"
                  min={0.7}
                  max={1.2}
                  step={0.01}
                />
                <input
                  type="number"
                  value={listWidthScale}
                  onChange={(e) => setListWidthScale(Number(e.target.value))}
                  className="w-20 border rounded px-2 py-1"
                  min={0.7}
                  max={1.2}
                  step={0.01}
                />
              </label>
            ) : null}

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
            {expandedBarcodes.map((item) => {
              const displayName = getListDisplayName(item);
              const key = `${item.id || item.barcode}-${item._dupIdx ?? 0}`;

              // LIST (font-only) sizing
              const baseFontSize = 40; // ยิ่งมาก “กว้างขึ้น” (ไม่เกี่ยวกับความสูง)
              const safeHeight = Number.isFinite(Number(effectiveBarcodeHeight))
                ? Number(effectiveBarcodeHeight)
                : 30;
              const scaleY = Math.max(0.2, safeHeight / baseFontSize);
              const safeScaleX = Math.max(0.6, Math.min(1.4, Number(listWidthScale) || 1));

              return (
                <div
                  key={key}
                  className={`barcode-cell ${
                    printLayout === 'list'
                      ? 'text-center flex flex-col items-center justify-center'
                      : 'border p-0.5 rounded text-center flex flex-col items-center justify-center'
                  }`}
                >
                  {/* ✅ ห่อทุกอย่างด้วย .barcode-block เพื่อให้ “ความกว้างชื่อสินค้า = ความกว้างบาร์โค้ด” */}
                  <div className="barcode-block">
                    {/* ✅ ชื่อสินค้า: 2 บรรทัด + ตัด … (ทั้ง LIST/GRID) */}
                    <div
                      className={printLayout === 'list' ? 'list-product-name' : 'barcode-product-name'}
                      title={item.productName || ''}
                      style={
                        measuredBarcodeWidths[key]
                          ? { width: `${measuredBarcodeWidths[key]}px`, maxWidth: `${measuredBarcodeWidths[key]}px` }
                          : undefined
                      }
                    >
                      {displayName}
                    </div>

                    {/* ✅ LIST = font-only (Code39) */}
                    {printLayout === 'list' ? (
                      showBarcode ? (
                        <div
                          className="c39-barcode"
                          ref={(el) => measureBarcodeWidth(key, el)}
                          style={{
                            fontSize: `${baseFontSize}px`,
                            lineHeight: 1,
                            display: 'inline-block',
                            transform: `scaleX(${safeScaleX}) scaleY(${scaleY})`,
                            transformOrigin: 'center top',
                          }}
                        >
                          {`*${item.barcode}*`}
                        </div>
                      ) : null
                    ) : (
                      <div className="inline-block" ref={(el) => measureBarcodeWidth(key, el)}>
                        <BarcodeWithQRRenderer
                          barcodeValue={showBarcode ? item.barcode : null}
                          qrValue={showQR ? item.barcode : null}
                          productName={''}
                          showProductName={false}
                          barcodeHeight={effectiveBarcodeHeight}
                          barcodeWidth={barcodeWidth}
                          fontSize={6}
                          marginTopText={-4}
                          layout="grid"
                        />
                      </div>
                    )}

                    {/* ✅ QR เสริมในโหมด LIST */}
                    {printLayout === 'list' && showQR ? (
                      <div className="mt-1">
                        <BarcodeWithQRRenderer
                          barcodeValue={null}
                          qrValue={item.barcode}
                          productName={''}
                          showProductName={false}
                          barcodeHeight={effectiveBarcodeHeight}
                          barcodeWidth={barcodeWidth}
                          fontSize={6}
                          marginTopText={-4}
                          layout="qr"
                        />
                      </div>
                    ) : null}
                  </div>
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


