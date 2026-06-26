// src/features/barcode/pages/BarcodeRangePrintPage.jsx
// Unified Premium Custom Barcode: (Restored Core Logic, Fixed Template String & Tenant-Safe Routing)
import React, { useMemo, useState } from 'react';
import c39FontUrl from '@/assets/fonts/c39hrp24dhtt.ttf?url';
// 🟢 [IMPORT FIXED] ดึง useParams จากระนาบหลักเพื่อสกัดสิทธิ์ชื่อสาขาพาร์ตเนอร์คั่น URL
import { useNavigate, useParams } from 'react-router-dom';
import { Settings, SlidersHorizontal, RefreshCw, Printer, Trash2, ArrowLeft, Barcode, Tag, User, Search } from 'lucide-react';

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
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/60 p-4 text-xs font-bold text-emerald-800 animate-slideUp">
      <div>สร้างบาร์โค้ดเสถียรแล้ว <span className="font-black text-emerald-700 text-sm">{items.length}</span> รายการ</div>
      <div className="mt-1 break-all text-[11px] text-emerald-600 font-mono">{summaryLabel}</div>
    </div>
  );
};

const PageMessage = ({ type = 'error', message = '' }) => {
  if (!message) return null;

  const className =
    type === 'error'
      ? 'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-black text-rose-600 flex items-center gap-1.5'
      : 'rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-black text-blue-600 flex items-center gap-1.5';

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
    <div className="barcode-cell border border-slate-200 p-2 rounded-xl bg-white text-left flex flex-col items-center justify-center overflow-hidden shadow-sm hover:shadow transition-shadow">
      <div className="barcode-block">
        <div className="barcode-bars-wrap">
          <div className="barcode-bars-only" style={{ '--barcode-font-size': `${fontSizePx}px` }}>
            <div style={fontStyle} className="c39-barcode select-all">
              {wrapCode39Value(value)}
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono font-black tracking-widest text-slate-400 mt-1 select-all">{value}</div>
      </div>
    </div>
  );
};

const BarcodeRangePrintPage = () => {
  const navigate = useNavigate();
  // 🟢 [SLUG ACTIVATED] แกะชื่อร้านค้าคั่น URL จากระบบกลางเพื่อสับสายพาน Multi-Tenant
  const { shopSlug } = useParams();

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
      setPageInfo('สร้างรายการบาร์โค้ดเรียบร้อยแล้ว สามารถตรวจสอบตัวอย่างก่อนสั่งพิมพ์ได้');
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

  // 🟢 [BUG FIX RESOLVED] แก้ไขช่องโหว่การสับรางที่ปิด Template String พังพินาศ คืนระนาบคืนสิทธิ์รายสาขาถาวร
  const handleBackAction = () => {
    const targetSlug = shopSlug || 'advancetech';
    navigate(`/${targetSlug}/pos/purchases/barcodes`);
  };

  return (
    <div className="w-full h-full p-4 md:p-6 space-y-6 text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn print:bg-white print:p-0 print-root font-sans">
      <style>{`
        @font-face {
          font-family: 'C39HrP24DhTt';
          src: url('${c39FontUrl}') format('truetype');
        }
        .barcode-cell { overflow: hidden; min-width: 0; }
        .barcode-block { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; max-width: 100%; overflow: hidden; min-width: 0; }
        .c39-barcode { font-family: 'C39HrP24DhTt', monospace !important; letter-spacing: 0; white-space: nowrap; }
        .barcode-bars-only { overflow: hidden; height: calc(var(--barcode-font-size, 30px) * 1.2); display: flex; align-items: flex-start; justify-content: center; width: 100%; }
        .barcode-bars-wrap { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; width: 100%; }
        @media print {
          @page { margin: 0mm; size: A4; }
          .print-hide { display: none !important; }
          html, body { margin: 0 !important; padding: 0 !important; background: white; }
          .print-root { padding: 0 !important; margin: 0 !important; }
          .print-root > * { margin-top: 0 !important; }
          .mt-1 { margin-top: 0 !important; }
          .print-area { width: 100% !important; justify-content: flex-start !important; justify-items: start !important; align-content: start !important; align-items: start !important; padding: 0 !important; margin: 0 !important; }
          .print-area .shadow, .print-area .border, .print-area .rounded-xl { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>

      {/* 🟦 1. ส่วนหัวแผงควบคุมสไตล์ Glassmorphism ผสานข้อมูลสรุปดั้งเดิมครบถ้วน */}
      <div className="bg-white/80 border border-slate-200/80 p-6 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.01)] backdrop-blur-md flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 transition-all duration-300 print:hidden select-none">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Barcode className="w-5 h-5 text-orange-500" /> พรีวิวบาร์โค้ดแบบกำหนดเอง
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-bold">
            Custom Barcode Command • จัดวางขนาดแท่ง ย่อสัดส่วนฟอนต์ และสั่งรันเลขพัสดุประเภทสินค้าทั่วไปหน้าร้าน
          </p>
        </div>

        {/* 🟢 คืนค่ากลุ่มข้อมูลสรุปสถานะดั้งเดิม (Summary Row Info) ครบทุกฟิลด์ */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-xs font-black text-slate-500 xl:ml-auto">
          <div>
            <span className="text-gray-400 font-bold">{inputMode === 'manual' ? 'รายการกำหนดเอง:' : 'ช่วงเลข:'}</span>{' '}
            <span className="text-slate-900 font-sans">
              {hasItems
                ? inputMode === 'manual'
                  ? `${generatedItems.length} รายการ`
                  : `${generatedItems[0]} - ${generatedItems[generatedItems.length - 1]}`
                : '-'}
            </span>
          </div>
          <div>Labels: <span className="text-orange-500 font-sans text-sm">{generatedItems.length}</span></div>
          <div>สถานะ: <span className="px-2 py-0.5 bg-slate-200/60 rounded-md text-[10px] text-slate-600">ยังไม่ผูกฐานข้อมูล</span></div>
        </div>
      </div>

      {/* 🎛️ 2. แผงควบคุมกล่องคอนโซลรับค่าและสลับโหมดแคบซูล */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] print:hidden space-y-5">
        
        {/* แถบสวิตช์วิทยุออโรร่า */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-3 select-none">
          <label className="flex items-center gap-2 text-xs font-black text-slate-600 cursor-pointer">
            <input
              type="radio"
              name="barcode-input-mode"
              checked={inputMode === 'range'}
              onChange={() => setInputMode('range')}
              className="accent-orange-500 h-4 w-4"
            />
            ช่วงเลขรันอัตโนมัติ
          </label>

          <label className="flex items-center gap-2 text-xs font-black text-slate-600 cursor-pointer">
            <input
              type="radio"
              name="barcode-input-mode"
              checked={inputMode === 'manual'}
              onChange={() => setInputMode('manual')}
              className="accent-orange-500 h-4 w-4"
            />
            กรอกเองหลายรายการ
          </label>
        </div>

        {/* ชุดเครื่องมือกรอกฟิลด์ดั้งเดิมและปุ่มฟังก์ชัน (Restored Full Parameters Inputs) */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-500">
          <label className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> คอลัมน์:
            <input type="number" value={columns} onChange={(event) => setColumns(Number(event.target.value))} className="w-14 bg-transparent focus:outline-none text-slate-900 font-sans text-sm font-black" min={1} max={12} step={1} />
          </label>

          <label className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Settings className="w-3.5 h-3.5 text-slate-400" /> ความกว้างฟอนต์:
            <input type="number" value={fontScaleX} onChange={(event) => setFontScaleX(Number(event.target.value))} className="w-16 bg-transparent focus:outline-none text-slate-900 font-sans text-sm font-black" min={0.6} max={1.6} step={0.1} />
          </label>

          <label className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Settings className="w-3.5 h-3.5 text-slate-400" /> ขนาดฟอนต์:
            <input type="number" value={fontSizePx} onChange={(event) => setFontSizePx(Number(event.target.value))} className="w-16 bg-transparent focus:outline-none text-slate-900 font-sans text-sm font-black" min={14} max={60} step={1} />
          </label>

          {inputMode === 'range' && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <label className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span>เลขเริ่มต้น:</span>
                <input type="text" inputMode="numeric" value={startNumber} onChange={(event) => setStartNumber(normalizeDigits(event.target.value))} className="w-24 bg-transparent focus:outline-none text-slate-900 font-mono text-sm font-black" />
              </label>
              <label className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span>เลขสิ้นสุด:</span>
                <input type="text" inputMode="numeric" value={endNumber} onChange={(event) => setEndNumber(normalizeDigits(event.target.value))} className="w-24 bg-transparent focus:outline-none text-slate-900 font-mono text-sm font-black" />
              </label>
            </div>
          )}

          {/* ชุดปุ่มกดคำสั่งสปริงฟิสิกส์ครอบคลุมลอจิกเดิมครบทุกชื่อฟังก์ชัน */}
          <div className="flex items-center gap-2 sm:ml-auto select-none w-full sm:w-auto pt-2 sm:pt-0">
            <button type="button" onClick={handleGenerateAction} className="flex-1 sm:flex-none h-9 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl active:scale-95 transform transition-all flex items-center justify-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> สร้างตัวอย่าง</button>
            <button type="button" onClick={handlePrintAction} className="flex-1 sm:flex-none h-9 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl active:scale-95 border border-orange-400/10 shadow-[0_4px_12px_rgba(249,115,22,0.2)] transform transition-all flex items-center justify-center gap-1"><Printer className="w-4 h-4" /> พิมพ์บาร์โค้ด</button>
            <button type="button" onClick={handleClearAction} className="h-9 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl active:scale-95 transform transition-all flex items-center justify-center">ล้าง</button>
            <button type="button" onClick={handleBackAction} className="h-9 px-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 active:scale-95 transform transition-all flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> กลับหน้ารายการ</button>
          </div>
        </div>

        {inputMode === 'manual' && (
          <div className="mt-3 space-y-1.5 animate-fadeIn">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">กรอกบาร์โค้ดเองหลายรายการ</label>
            <textarea value={manualInput} onChange={(event) => setManualInput(event.target.value)} className="min-h-[140px] w-full text-sm font-mono font-bold p-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl outline-none focus:border-orange-500 transition-all shadow-inner h-28 resize-none" placeholder={"กรอก 1 รายการต่อ 1 บรรทัด\nหรือคั่นด้วย comma เช่น 0000001,0000123,9988776"} />
            <div className="text-[10px] text-slate-400 font-bold select-none">รองรับตัวเลขเท่านั้น ระบบจะตัดบรรทัดว่างและรายการซ้ำออกอัตโนมัติ สูงสุด {MAX_PRINT_ITEMS} รายการต่อครั้ง</div>
          </div>
        )}
      </div>

      {/* ⚠️ 3. ส่วนข้อความแจ้งเตือนระบบดั้งเดิม */}
      <div className="print:hidden space-y-2">
        <PageMessage type="error" message={pageError} />
        <PageMessage type="info" message={pageInfo} />
        <RangeSummary items={generatedItems} inputMode={inputMode} />
      </div>

      <hr className="print:hidden border-slate-200" />

      {/* 📊 4. ส่วนแสดงผลแผ่น Preview บาร์โค้ดตัวเต็ม */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.01)] print:rounded-none print:border-0 print:p-0 print:shadow-none animate-fadeIn">
        <div className="print-hide mb-4 border-b border-slate-200 pb-3 select-none">
          <h2 className="text-lg font-semibold text-slate-900">{previewTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">แสดงเฉพาะตัวเลขและบาร์โค้ดตามที่ผู้ใช้ต้องการ โดยไม่มีชื่อสินค้าและรุ่นสินค้า</p>
        </div>

        {hasItems ? (
          <div className="grid gap-y-[0.8mm] gap-x-[1.5mm] mt-1 print-area" style={gridStyle}>
            {generatedItems.map((value) => (
              <BarcodeLabelCard key={value} value={value} fontScaleX={fontScaleX} fontSizePx={fontSizePx} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 print:hidden select-none">
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