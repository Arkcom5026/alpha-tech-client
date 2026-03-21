import React, { useMemo, useState } from 'react';
import Barcode from 'react-barcode';

const MAX_PRINT_ITEMS = 500;
const DEFAULT_PAD_LENGTH = 7;

const normalizeDigits = (value = '') => String(value).replace(/\D/g, '');

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

const RangeSummary = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
      <div>
        สร้างบาร์โค้ดแล้ว <strong>{items.length}</strong> รายการ
      </div>
      <div className="mt-1 break-all text-xs text-emerald-700">
        ช่วงเลข: {items[0]} - {items[items.length - 1]}
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

const BarcodeCard = ({ value }) => {
  return (
    <div className="break-inside-avoid rounded-md border border-slate-200 bg-white px-3 py-3 text-center print:border print:border-slate-300 print:shadow-none">
      <div className="flex justify-center overflow-hidden">
        <Barcode
          value={value}
          format="CODE128"
          width={1.5}
          height={42}
          margin={0}
          displayValue={false}
          background="transparent"
        />
      </div>
      <div className="mt-2 text-sm font-medium tracking-wider text-slate-800">
        {value}
      </div>
    </div>
  );
};

const BarcodeRangePrintPage = () => {
  const [startNumber, setStartNumber] = useState('0000001');
  const [endNumber, setEndNumber] = useState('0000010');
  const [generatedItems, setGeneratedItems] = useState([]);
  const [pageError, setPageError] = useState('');
  const [pageInfo, setPageInfo] = useState('');

  const hasItems = generatedItems.length > 0;

  const previewTitle = useMemo(() => {
    if (!hasItems) return 'ยังไม่มีข้อมูลสำหรับพิมพ์';
    return `ตัวอย่างบาร์โค้ด ${generatedItems.length} รายการ`;
  }, [generatedItems, hasItems]);

  const handleGenerateAction = () => {
    try {
      setPageError('');
      setPageInfo('');

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
    setStartNumber('');
    setEndNumber('');
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 print:bg-white print:p-0">
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            .print-hide {
              display: none !important;
            }

            .barcode-print-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: 10px !important;
            }
          }
        `}
      </style>

      <div className="mx-auto max-w-7xl space-y-4">
        <div className="print-hide rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-slate-900">
              พิมพ์บาร์โค้ดจากช่วงเลข
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              ใช้สำหรับพิมพ์บาร์โค้ดจากเลขที่ผู้ใช้กำหนดเอง
              โดยไม่ผูกกับสินค้าและไม่บันทึกลงฐานข้อมูล
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                เลขเริ่มต้น
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                placeholder="เช่น 0000001"
                value={startNumber}
                onChange={(event) =>
                  setStartNumber(normalizeDigits(event.target.value))
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                เลขสิ้นสุด
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                placeholder="เช่น 0000010"
                value={endNumber}
                onChange={(event) =>
                  setEndNumber(normalizeDigits(event.target.value))
                }
              />
            </div>

            <div className="md:col-span-2 xl:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                เงื่อนไขการสร้าง
              </label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                ระบบจะเติมเลข 0 ด้านหน้าอัตโนมัติตามความยาวของช่วงเลข
                และพิมพ์ได้สูงสุด {MAX_PRINT_ITEMS} รายการต่อครั้ง
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              onClick={handleGenerateAction}
            >
              สร้างตัวอย่าง
            </button>

            <button
              type="button"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              onClick={handlePrintAction}
            >
              พิมพ์
            </button>

            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={handleClearAction}
            >
              ล้าง
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <PageMessage type="error" message={pageError} />
            <PageMessage type="info" message={pageInfo} />
            <RangeSummary items={generatedItems} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="print-hide mb-4 border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {previewTitle}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              แสดงเฉพาะตัวเลขและบาร์โค้ดตามที่ผู้ใช้ต้องการ
              โดยไม่มีชื่อสินค้าและรุ่นสินค้า
            </p>
          </div>

          {hasItems ? (
            <div className="barcode-print-grid grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {generatedItems.map((value) => (
                <BarcodeCard key={value} value={value} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 print:hidden">
              ยังไม่มีรายการบาร์โค้ด กรุณากรอกช่วงเลขแล้วกด “สร้างตัวอย่าง”
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeRangePrintPage;