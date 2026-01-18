
// src/pages/pos/barcode/PreviewBarcodePage.jsx

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import useBarcodeStore from '@/features/barcode/store/barcodeStore';
import c39FontUrl from '@/assets/fonts/c39hrp24dhtt.ttf?url';
import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

const PreviewBarcodePage = () => {
  // ✅ ชื่อสินค้าสำหรับงานพิมพ์ (รองรับ Production)
  // - บังคับ “ไม่เกิน 2 บรรทัด” แบบ deterministic (ไม่พึ่ง line-clamp อย่างเดียว)
  // - ใช้ความกว้างของบาร์โค้ด (px) เพื่อคำนวณจำนวนตัวอักษรสูงสุด
  // - มี fallback กันเคสคำยาวติดกัน/ไม่มีช่องว่าง
  const getListDisplayNameByWidth = useCallback((item, widthPx) => {
    const raw = (item?.productName || '').toString().trim();
    if (!raw) return 'ชื่อสินค้าไม่พบ';

    const w = Math.max(48, Number(widthPx) || 0);

    // ✅ ปรับได้: font ชื่อสินค้า 11px, ค่าเฉลี่ยความกว้างตัวอักษร ~0.55em
    // เพื่อกัน “หน้า Before Print” ที่บางครั้ง line-clamp เพี้ยนจนโผล่บรรทัดที่ 3
    const NAME_FONT_PX = 11;
    const AVG_CHAR_PX = NAME_FONT_PX * 0.55;

    // ลดนิดเพื่อกัน padding/การปัดเศษของ Chrome
    const safeW = Math.max(24, w - 6);

    const charsPerLine = Math.max(8, Math.floor(safeW / AVG_CHAR_PX));
    const maxChars = Math.max(16, charsPerLine * 2);

    if (raw.length <= maxChars) return raw;

    // ✅ ตัดแบบนิ่ง + ellipsis
    const sliced = raw.slice(0, Math.max(0, maxChars - 1)).trim();
    return `${sliced}…`;
  }, []);

  const { receiptId } = useParams();
  const { barcodes, loadBarcodesAction, markBarcodeAsPrintedAction } = useBarcodeStore();
  const { markReceiptAsPrintedAction } = usePurchaseOrderReceiptStore();

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ✅ โหมดพิมพ์ (Production): ใช้ font-only (Code39) เท่านั้น
  // เหตุผล: สินค้าชิ้นเล็ก → ต้องย่อได้มากและยังสแกนเสถียร
  const [fontScaleX, setFontScaleX] = useState(1.0);

  // ✅ กันพฤติกรรมไม่สม่ำเสมอของ Chrome Print Preview (บางเครื่อง/บางไดรเวอร์อาจไม่ apply transform: scaleX)
  // เราจะ “ตรึงโหมดพิมพ์” ให้ใช้ความกว้างแบบไม่พึ่ง transform เพื่อให้ชื่อสินค้าไม่ล้นบาร์โค้ดในหน้า Before Print
  const [isPrinting, setIsPrinting] = useState(false);
  const [fontSizePx, setFontSizePx] = useState(28);

  // ✅ จำนวนคอลัมน์ (GRID)
  const [columns, setColumns] = useState(10);
  // (ลบแล้ว) effectiveBarcodeHeight / barcodeHeight — ใช้ font-only ไม่ต้องคุมความสูงด้วย state แยก

  // ✅ คุมความกว้าง “ชื่อสินค้า” ให้ไม่เกินบาร์โค้ด (Production-friendly)
  // หมายเหตุ: หลีกเลี่ยงการวัด DOM เพราะ print preview ของ Chrome/Windows มัก scale/layout ต่างจากหน้าเว็บ
  // ใช้การประมาณความกว้างจากจำนวนตัวอักษร + fontSize + scale แทน เพื่อให้ผลนิ่งทั้งหน้า Preview และหน้า Print
  const getApproxBarcodeWidthPx = useCallback(
    (barcode) => {
      const text = (barcode || '').toString();
      // Code39 ต้องมี * ครอบ (start/stop)
      const len = Math.max(0, text.length + 2);

      // ✅ สำคัญ: ตอนพิมพ์จริง/หน้า Before Print ให้ “ไม่พึ่ง transform scaleX”
      // เพราะบางเครื่อง Print Preview จะ ignore transform ทำให้บาร์แคบลง แต่ชื่อยังยาว → ดูเหมือนล้นบาร์
      const effectiveScaleX = isPrinting ? 1 : Math.max(0.6, Number(fontScaleX) || 1);

      // ค่าสัดส่วนนี้ตั้งใจให้ "กว้างพอ" (กันตัดบาร์) และนิ่งข้าม print preview
      const k = 0.72; // px-per-char factor (tuned for Code39 glyph width)
      const w = Math.round(len * fontSizePx * effectiveScaleX * k);
      return Math.max(48, w);
    },
    [fontSizePx, fontScaleX, isPrinting]
  );

  // ใช้ helper จาก store เพื่อขยายจำนวนดวงของ LOT ตาม qtyLabelsSuggested
  const getExpandedBarcodesForPrint = useBarcodeStore((s) => s.getExpandedBarcodesForPrint);
  const [useSuggested, setUseSuggested] = useState(true);

  // ✅ วัด “ความกว้างบาร์โค้ดจริง” จาก DOM เพื่อให้ชื่อสินค้าไม่เกินบาร์โค้ด
  // เหตุผล: Chrome Print Preview บางเครื่อง scale/ignore transform ทำให้ค่าประมาณเพี้ยน
  const barcodeElsRef = useRef(new Map());
  const [barcodeWidthMap, setBarcodeWidthMap] = useState({});

  const setBarcodeElRef = useCallback((key) => (el) => {
    if (!key) return;
    if (el) barcodeElsRef.current.set(key, el);
    else barcodeElsRef.current.delete(key);
  }, []);

  const measureBarcodeWidths = useCallback(() => {
    const next = {};
    barcodeElsRef.current.forEach((el, key) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect?.width || 0);
      if (w > 0) next[key] = Math.max(48, w);
    });
    setBarcodeWidthMap(next);
  }, []);

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

  // ✅ Detect print mode (beforeprint/afterprint + matchMedia('print')) เพื่อให้ layout ในหน้า Before Print ไม่เพี้ยน
  useEffect(() => {
    const onBeforePrint = () => {
      setIsPrinting(true);
      // ✅ รอ layout print-mode (transform:none) แล้วค่อยวัดความกว้างจริง
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    };

    const onAfterPrint = () => {
      setIsPrinting(false);
      // ✅ กลับมาโหมดปกติ วัดใหม่อีกครั้ง (transform: scaleX)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    // ✅ บางเครื่อง/บางไดรเวอร์อาจไม่ยิง beforeprint ตอนเปิด Print Preview
    // ใช้ matchMedia('print') เป็น fallback เพื่อให้ isPrinting + measure ทำงานเสถียร
    const mql = window.matchMedia?.('print');
    const onMqlChange = (e) => {
      const printing = !!e?.matches;
      setIsPrinting(printing);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    };

    if (mql) {
      if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onMqlChange);
      else if (typeof mql.addListener === 'function') mql.addListener(onMqlChange);
    }

    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);

      if (mql) {
        if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onMqlChange);
        else if (typeof mql.removeListener === 'function') mql.removeListener(onMqlChange);
      }
    };
  }, [measureBarcodeWidths]);

  // ✅ วัดความกว้างเมื่อข้อมูล/การตั้งค่าเปลี่ยน (ทั้งหน้า Preview และหน้า Print)
  useEffect(() => {
    if (!loaded || expandedBarcodes.length === 0) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => measureBarcodeWidths());
    });
  }, [loaded, expandedBarcodes.length, fontSizePx, fontScaleX, isPrinting, columns, measureBarcodeWidths]);

  // ✅ บังคับวัดใหม่หลังฟอนต์โหลด (ลดความเพี้ยนใน Chrome/Windows Print Preview)
  useEffect(() => {
    if (!loaded || expandedBarcodes.length === 0) return;

    let cancelled = false;

    const run = async () => {
      try {
        if (document?.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // ignore
      }

      if (cancelled) return;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [loaded, expandedBarcodes.length, measureBarcodeWidths]);

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
    const colCount = Math.max(1, Number(columns) || 1);
    return {
      // ✅ minmax(0, max-content) ช่วยกันการขยายคอลัมน์เพราะข้อความยาวในบาง print preview
      gridTemplateColumns: `repeat(${colCount}, minmax(0, max-content))`,
      justifyContent: 'flex-start',
    };
  }, [columns]);

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

        /* ✅ ชื่อสินค้า (font-only): กว้างตาม .barcode-block และตัด … */

       .barcode-product-name {
  position: relative;
  z-index: 2;
  background: #fff;
  padding: 0 1px;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
  font-size: 11px;
  line-height: 12px; /* ✅ lock line height (print preview stable) */
  letter-spacing: 0.4px;
  margin-bottom: 2px;
  text-align: left;

  /* ✅ Hard cap = exactly 2 lines (prevents "line 3" bleeding into bars in Print Preview) */
  height: 24px;      /* 12px * 2 */
  max-height: 24px;
  overflow: hidden;

  /* ✅ Support clamp (extra safety) */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  /* ✅ handle long tokens */
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}




        /* ✅ กล่องที่ “ล็อกความกว้าง” ให้ยึดตามบาร์โค้ด (shrink-to-fit) */
        .barcode-block {
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          max-width: 100%;
          overflow: hidden; /* ✅ กันล้นในหน้า Before Print */
          min-width: 0;     /* ✅ ให้ ellipsis/flex shrink ทำงานเสถียร */
        }

        /* ✅ กันไม่ให้เนื้อหาใน cell ล้นตอน print preview */
        .barcode-cell {
          overflow: hidden;
          min-width: 0; /* ✅ กัน grid cell ขยายเพราะข้อความ */
        }

        /* ✅ Font-only: ฟอนต์สำหรับวาดแท่งบาร์ (Code39) */
        .c39-barcode {
          font-family: 'C39HrP24DhTt', monospace !important;
          letter-spacing: 0;
          white-space: nowrap;
        }

        /* ✅ กันตัวบาร์ (transform/font glyph) ล้ำขึ้นไปซ้อนชื่อสินค้า */
        .barcode-bars-wrap {
          position: relative;
          z-index: 1;
          padding-top: 2px;
        }

        @media print {
          /* ✅ ดันบาร์โค้ดชิดบน + ชิดซ้าย ในหน้า Print Preview */
          html, body { margin: 0 !important; padding: 0 !important; background: white; }

          /* ✅ ลด whitespace จาก wrapper/spacing ของหน้า */
          .print-root { padding: 0 !important; margin: 0 !important; }
          .print-root > * { margin-top: 0 !important; }
          .mt-1 { margin-top: 0 !important; }

          /* ✅ บังคับ grid ให้อยู่ซ้ายบนเสมอ (กัน Chrome print preview ชอบจัดกลาง) */
          .print-area {
            width: 100% !important;
            justify-content: flex-start !important;
            justify-items: start !important;
            align-content: start !important;
            align-items: start !important;
          }

          /* ✅ ดันบาร์โค้ดชิดบน + ชิดซ้าย ในหน้า Print Preview */
          .print-area { margin-top: 0 !important; justify-content: flex-start !important; }
          .p-6 { padding-top: 0 !important; padding-bottom: 0 !important; }

          body { margin: 0; padding: 0; background: white; }
          .print-area { padding: 0; margin: 0; }
          .print-area .shadow, .print-area .border, .print-area .rounded-xl {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .print-area .p-1 { padding: 0 !important; }
          /* ✅ บังคับล็อกความสูงชื่อสินค้า (กันทับบาร์ใน print preview) */
          .barcode-product-name {
            height: 2.35em !important;
            max-height: 2.35em !important;
            overflow: hidden !important;
          }

          @page { margin: 0mm; size: A4; }
          header, footer, nav, .print-hidden { display: none !important; }
        }
      `}</style>

      <div className="p-6 space-y-6 print-root">
        <h1 className="text-xl font-bold print:hidden">พรีวิวบาร์โค้ด</h1>

        <div className="flex justify-center">
          <div className="flex gap-4 items-center flex-wrap print:hidden">


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


            {/* ✅ ตั้งค่าเฉพาะโหมดฟอนต์ (font-only) */}
            <label className="flex items-center gap-2">
              ความกว้างฟอนต์:
              <input
                type="number"
                value={fontScaleX}
                onChange={(e) => setFontScaleX(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1"
                min={0.6}
                max={1.6}
                step={0.1}
              />
            </label>

            <label className="flex items-center gap-2">
              ขนาดฟอนต์:
              <input
                type="number"
                value={fontSizePx}
                onChange={(e) => setFontSizePx(Number(e.target.value))}
                className="w-20 border rounded px-2 py-1"
                min={14}
                max={60}
                step={1}
              />
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

        <hr className="print:hidden" />

        {!loaded ? (
          <p className="text-gray-500 mt-4 print:hidden">กำลังเตรียมข้อมูลบาร์โค้ด...</p>
        ) : barcodes.length === 0 ? (
          <p className="text-red-500 mt-4 print:hidden">ไม่พบบาร์โค้ดจากใบรับสินค้านี้</p>
        ) : (
          <div
            className={`grid gap-y-[1mm] gap-x-[2mm] mt-1 print-area is-grid`}
            style={gridStyle}
          >
            {expandedBarcodes.map((item) => {
              const rowKey = `${item.id || item.barcode}-${item._dupIdx ?? 0}`;

              const measuredW = Number(barcodeWidthMap[rowKey] || 0);
              const approxW = getApproxBarcodeWidthPx(item.barcode);
              const finalW = Math.max(48, measuredW > 0 ? measuredW : approxW);

              const displayName = getListDisplayNameByWidth(item, finalW);

              return (
                <div
                  key={rowKey}
                  className="barcode-cell border p-0.5 rounded text-left flex flex-col items-start justify-start"
                >
                  <div
                    className="barcode-block"
                    style={{ width: `${finalW}px`, maxWidth: `${finalW}px` }}
                  >
                    <div className="barcode-product-name" title={item.productName || ''}>
                      {displayName}
                    </div>

                    <div className="inline-block barcode-bars-wrap">
                      <div
                        ref={setBarcodeElRef(rowKey)}
                        className="c39-barcode"
                        style={{
                          fontSize: `${fontSizePx}px`,
                          lineHeight: 1,
                          transform: isPrinting ? 'none' : `scaleX(${fontScaleX})`,
                          transformOrigin: 'left top',
                          display: 'inline-block',
                          marginTop: '0px',
                        }}
                      >
                        *{item.barcode}*
                      </div>
                    </div>
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














