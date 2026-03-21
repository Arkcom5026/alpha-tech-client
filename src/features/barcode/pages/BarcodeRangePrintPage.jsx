// src/features/barcode/pages/BarcodeRangePrintPage.jsx

import React, { useMemo, useState } from 'react';
import c39FontUrl from '@/assets/fonts/c39hrp24dhtt.ttf?url';
import { useNavigate } from 'react-router-dom';

const MAX_PRINT_ITEMS = 500;
const DEFAULT_PAD_LENGTH = 7;

const normalizeDigits = (value = '') => String(value).replace(/\D/g, '');
const wrapCode39Value = (value = '') => `*${String(value)}*`;

const buildManualItems = (rawInput = '') => {
  const rawTokens = String(rawInput)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!rawTokens.length) {
    throw new Error('กรุณากรอกรายการบาร์โค้ดอย่างน้อย 1 รายการ');
  }

  const invalidTokens = rawTokens.filter((item) => !/^\d+$/.test(item));
  if (invalidTokens.length > 0) {
    throw new Error(
      `พบข้อมูลที่ไม่ใช่ตัวเลข: ${invalidTokens.slice(0, 3).join(', ')}`
    );
  }

  const uniqueItems = [];
  const seen = new Set();
  let duplicateCount = 0;

  rawTokens.forEach((item) => {
    if (seen.has(item)) {
      duplicateCount += 1;
      return;
    }

    seen.add(item);
    
    uniqueItems.push(item);
  });

  if (uniqueItems.length > MAX_PRINT_ITEMS) {
    throw new Error(`พิมพ์ได้ไม่เกิน ${MAX_PRINT_ITEMS} รายการต่อครั้ง`);
  }

  return {
    items: uniqueItems,
    duplicateCount,
  };
};

const buildRangeItems = ({ startRaw, endRaw }) => {
  const startDigits = normalizeDigits(startRaw);
  const endDigits = normalizeDigits(endRaw);

  if (!startDigits || !endDigits) {
    throw new Error('กรุณากรอกเลขเริ่มต้นและเลขสิ้นสุด');
  }

  const start = Number(startDigits);
  const end = Number(endDigits);

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    throw new Error('ข้อมูลช่วงเลขไม่ถูกต้อง');
  }

  if (start > end) {
    throw new Error('เลขเริ่มต้นต้องน้อยกว่าหรือเท่ากับเลขสิ้นสุด');
  }

  const total = end - start + 1;
  if (total > MAX_PRINT_ITEMS) {
    throw new Error(`พิมพ์ได้ไม่เกิน ${MAX_PRINT_ITEMS} รายการต่อครั้ง`);
  }

  const padLength = Math.max(
    startDigits.length,
    endDigits.length,
    DEFAULT_PAD_LENGTH
  );

  return Array.from({ length: total }, (_, index) => {
    const current = start + index;
    return String(current).padStart(padLength, '0');
  });
};

const RangeSummary = ({ items, inputMode }) => {
  if (!items.length) return null;

  const summaryLabel =
    inputMode === 'manual'
      ? `รายการกำหนดเอง: ${items.length} รายการ`
      : `ช่วงเลข: ${items[0]} - ${items[items.length - 1]}`;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <div>
        สร้างบาร์โค้ดแล้ว <strong>{items.length}</strong> รายการ
      </div>
      <div className="mt-1 break-all text-xs text-emerald-700">
        {summaryLabel}
      </div>
    </div>
  );
};

const PageMessage = ({ type = 'error', message = '' }) => {
  if (!message) return null;

  const className =
    type === 'error'
      ? 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
      : 'rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700';

  return <div className={className}>{message}</div>;
};

const BarcodeLabelCard = ({ value, fontScaleX, fontSizePx }) => {
  const fontStyle = {
    fontFamily: 'C39HrP24DhTt, monospace',
    fontSize: `${fontSizePx}px`,
    lineHeight: 1,
    transform: `scaleX(${fontScaleX})`,
    transformOrigin: 'center top',
    display: 'inline-block',
  };

  return (
    <div className="barcode-cell border p-0.5 rounded text-left flex flex-col items-start justify-start overflow-hidden">
      <div className="barcode-block">
        <div className="barcode-bars-wrap">
          <div className="barcode-bars-only" style={{ '--barcode-font-size': `${fontSizePx}px` }}>
            <div style={fontStyle} className="c39-barcode">
              {wrapCode39Value(value)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BarcodeRangePrintPage = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState('range');
  const [manualInput, setManualInput] = useState('');
  const [startNumber, setStartNumber] = useState('0000001');
  const [endNumber, setEndNumber] = useState('0000010');
  const [generatedItems, setGeneratedItems] = useState([]);
  const [pageError, setPageError] = useState('');
  const [pageInfo, setPageInfo] = useState('');
  const [columns, setColumns] = useState(5);
  const [fontScaleX, setFontScaleX] = useState(1.1);
  const [fontSizePx, setFontSizePx] = useState(30);

  const hasItems = generatedItems.length > 0;

  const previewTitle = useMemo(() => {
    if (!hasItems) return 'ยังไม่มีข้อมูลสำหรับพิมพ์';
    return `ตัวอย่างบาร์โค้ด ${generatedItems.length} รายการ`;
  }, [generatedItems, hasItems]);

  const gridStyle = useMemo(() => {
    const colCount = Math.max(1, Number(columns) || 1);
    return {
      gridTemplateColumns: `repeat(${colCount}, minmax(0, max-content))`,
      justifyContent: 'flex-start',
    };
  }, [columns]);

  const handleGenerateAction = () => {
    try {
      setPageError('');
      setPageInfo('');

      if (inputMode === 'manual') {
        const { items, duplicateCount } = buildManualItems(manualInput);
        setGeneratedItems(items);
        setPageInfo(
          duplicateCount > 0
            ? `สร้างรายการบาร์โค้ดเรียบร้อยแล้ว และตัดรายการซ้ำออก ${duplicateCount} รายการ`
            : 'สร้างรายการบาร์โค้ดเรียบร้อยแล้ว สามารถตรวจสอบตัวอย่างก่อนสั่งพิมพ์ได้'
        );
        return;
      }

      const items = buildRangeItems({
        startRaw: startNumber,
        endRaw: endNumber,
      });

      setGeneratedItems(items);
      setPageInfo(
        'สร้างรายการบาร์โค้ดเรียบร้อยแล้ว สามารถตรวจสอบตัวอย่างก่อนสั่งพิมพ์ได้'
      );
    } catch (error) {
      setGeneratedItems([]);
      setPageError(error?.message || 'ไม่สามารถสร้างรายการบาร์โค้ดได้');
    }
  };

  const handleClearAction = () => {
    setStartNumber('0000001');
    setEndNumber('0000010');
    setManualInput('');
    setGeneratedItems([]);
    setPageError('');
    setPageInfo('ล้างข้อมูลเรียบร้อยแล้ว');
  };

  const handlePrintAction = () => {
    if (!generatedItems.length) {
      setPageError('กรุณาสร้างรายการบาร์โค้ดก่อนพิมพ์');
      setPageInfo('');
      return;
    }

    setPageError('');
    setPageInfo('');
    window.print();
  };

  const handleBackAction = () => {
    navigate('/pos/purchases/barcodes');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6 print:bg-white print:p-0 print-root">
      <style>{`
        @font-face {
          font-family: 'C39HrP24DhTt';
          src: url('${c39FontUrl}') format('truetype');
        }
      `}</style>
      <style>{`
        .barcode-cell {
          overflow: hidden;
          min-width: 0;
        }

        .barcode-block {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          overflow: hidden;
          min-width: 0;
        }

        .c39-barcode {
          font-family: 'C39HrP24DhTt', monospace !important;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .barcode-bars-only {
          overflow: hidden;
          height: calc(var(--barcode-font-size, 30px) * 1.2);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
        }

        .barcode-bars-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
        }

        @media print {
          @page {
            margin: 0mm;
            size: A4;
          }

          .print-hide {
            display: none !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white;
          }

          .print-root {
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-root > * {
            margin-top: 0 !important;
          }

          .mt-1 {
            margin-top: 0 !important;
          }

          .print-area {
            width: 100% !important;
            justify-content: flex-start !important;
            justify-items: start !important;
            align-content: start !important;
            align-items: start !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .print-area .shadow,
          .print-area .border,
          .print-area .rounded-xl {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      <h1 className="text-xl font-bold print:hidden">พรีวิวบาร์โค้ดแบบกำหนดเอง</h1>

      <div className="print:hidden rounded-lg border bg-white px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <span className="text-gray-600">
              {inputMode === 'manual' ? 'รายการกำหนดเอง:' : 'ช่วงเลข:'}
            </span>{' '}
            <span className="font-semibold">
              {hasItems
                ? inputMode === 'manual'
                  ? `${generatedItems.length} รายการ`
                  : `${generatedItems[0]} - ${generatedItems[generatedItems.length - 1]}`
                : '-'}
            </span>
          </div>
          <div><span className="text-gray-600">Labels:</span> <span className="font-semibold">{generatedItems.length}</span></div>
          <div><span className="text-gray-600">สถานะ:</span> <span className="font-semibold text-gray-700">ยังไม่ผูกฐานข้อมูล</span></div>
        </div>
      </div>

      <div className="print:hidden rounded-lg border bg-white px-4 py-3">
        <div className="mb-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="barcode-input-mode"
              checked={inputMode === 'range'}
              onChange={() => setInputMode('range')}
            />
            ช่วงเลข
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="barcode-input-mode"
              checked={inputMode === 'manual'}
              onChange={() => setInputMode('manual')}
            />
            กรอกเองหลายรายการ
          </label>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <label className="flex items-center gap-2">
            คอลัมน์:
            <input
              type="number"
              value={columns}
              onChange={(event) => setColumns(Number(event.target.value))}
              className="w-20 border rounded px-2 py-1"
              min={1}
              max={12}
              step={1}
            />
          </label>

          <label className="flex items-center gap-2">
            ความกว้างฟอนต์:
            <input
              type="number"
              value={fontScaleX}
              onChange={(event) => setFontScaleX(Number(event.target.value))}
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
              onChange={(event) => setFontSizePx(Number(event.target.value))}
              className="w-20 border rounded px-2 py-1"
              min={14}
              max={60}
              step={1}
            />
          </label>

          {inputMode === 'range' ? (
            <>
              <label className="flex items-center gap-2">
                เลขเริ่มต้น:
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-28 border rounded px-2 py-1"
                  value={startNumber}
                  onChange={(event) => setStartNumber(normalizeDigits(event.target.value))}
                />
              </label>

              <label className="flex items-center gap-2">
                เลขสิ้นสุด:
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-28 border rounded px-2 py-1"
                  value={endNumber}
                  onChange={(event) => setEndNumber(normalizeDigits(event.target.value))}
                />
              </label>
            </>
          ) : null}

          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleGenerateAction}
          >
            สร้างตัวอย่าง
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={handlePrintAction}
          >
            พิมพ์บาร์โค้ด
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            onClick={handleClearAction}
          >
            ล้าง
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-white border rounded text-gray-700 hover:bg-gray-50"
            onClick={handleBackAction}
          >
            กลับหน้ารายการ
          </button>
        </div>

        {inputMode === 'manual' ? (
          <div className="mt-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              กรอกบาร์โค้ดเองหลายรายการ
            </label>
            <textarea
              className="min-h-[140px] w-full rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder={
                `กรอก 1 รายการต่อ 1 บรรทัด
หรือคั่นด้วย comma เช่น 0000001,0000123,9988776`
              }
              value={manualInput}
              onChange={(event) => setManualInput(event.target.value)}
            />
            <div className="mt-1 text-xs text-slate-500">
              รองรับตัวเลขเท่านั้น ระบบจะตัดบรรทัดว่างและรายการซ้ำออกอัตโนมัติ สูงสุด {MAX_PRINT_ITEMS} รายการต่อครั้ง
            </div>
          </div>
        ) : null}
      </div>

      <div className="print:hidden space-y-3">
        <PageMessage type="error" message={pageError} />
        <PageMessage type="info" message={pageInfo} />
        <RangeSummary items={generatedItems} inputMode={inputMode} />
      </div>

      <hr className="print:hidden" />

      <div className="bg-white p-1 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="print-hide mb-4 border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            {previewTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            แสดงเฉพาะตัวเลขและบาร์โค้ดตามที่ผู้ใช้ต้องการ โดยไม่มีชื่อสินค้าและรุ่นสินค้า
          </p>
        </div>

        {hasItems ? (
          <div className="grid gap-y-[0.8mm] gap-x-[1.5mm] mt-1 print-area" style={gridStyle}>
            {generatedItems.map((value) => (
              <BarcodeLabelCard
                key={value}
                value={value}
                fontScaleX={fontScaleX}
                fontSizePx={fontSizePx}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 print:hidden">
            {inputMode === 'manual'
              ? 'ยังไม่มีรายการบาร์โค้ด กรุณากรอกข้อมูลที่ต้องการแล้วกด “สร้างตัวอย่าง”'
              : 'ยังไม่มีรายการบาร์โค้ด กรุณากรอกช่วงเลขแล้วกด “สร้างตัวอย่าง”'}
          </div>
        )}
      </div>
    </div>

  );
};

export default BarcodeRangePrintPage;

