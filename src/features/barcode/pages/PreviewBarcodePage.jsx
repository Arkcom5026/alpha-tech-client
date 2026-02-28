




  // src/pages/pos/barcode/PreviewBarcodePage.jsx

  import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
  import { useParams } from 'react-router-dom';
  import useBarcodeStore from '@/features/barcode/store/barcodeStore';
  import c39FontUrl from '@/assets/fonts/c39hrp24dhtt.ttf?url';
  import usePurchaseOrderReceiptStore from '@/features/purchaseOrderReceipt/store/purchaseOrderReceiptStore';

  // ✅ Tiny QR (Version 1-L, EC=L, Mask 0) — no external deps
  // - ใช้ Byte mode (0100) เพื่อความเข้ากันได้/เสถียรในการสแกน
  // - ทำให้ “ขนาดโมดูลเป็นจำนวนเต็ม” เสมอ เพื่อไม่ให้ภาพเบลอเวลา print/preview (สาเหตุหลักที่สแกนไม่ติด)
  // - Version 1-L รองรับข้อมูล ~17 bytes → เหมาะกับ barcode ส่วนใหญ่
  const QrSvg = ({ value, size = 100 }) => {
    const v = (value ?? '').toString().trim();

    // ---- GF(256) tables (primitive poly 0x11d)
    const gf = React.useMemo(() => {
      const exp = new Array(512).fill(0);
      const log = new Array(256).fill(0);
      let x = 1;
      for (let i = 0; i < 255; i++) {
        exp[i] = x;
        log[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
      }
      for (let i = 255; i < 512; i++) exp[i] = exp[i - 255];
      return { exp, log };
    }, []);

    const gfMul = React.useCallback(
      (a, b) => {
        if (a === 0 || b === 0) return 0;
        return gf.exp[gf.log[a] + gf.log[b]];
      },
      [gf]
    );

    // RS encode for Version 1-L: 19 data cw, 7 ecc cw
    // Generator (degree 7) for QR: [87,229,146,149,238,102,21]
    const rsEncode = React.useCallback(
      (dataCw) => {
        const gen = [87, 229, 146, 149, 238, 102, 21];
        const ecc = new Array(7).fill(0);
        for (let i = 0; i < dataCw.length; i++) {
          const factor = dataCw[i] ^ ecc[0];
          // shift left
          for (let j = 0; j < 6; j++) ecc[j] = ecc[j + 1];
          ecc[6] = 0;
          // apply generator
          for (let j = 0; j < 7; j++) {
            ecc[j] ^= gfMul(gen[j], factor);
          }
        }
        return ecc;
      },
      [gfMul]
    );

    const matrix = React.useMemo(() => {
      const N = 21;
      const m = Array.from({ length: N }, () => new Array(N).fill(null));

      const set = (r, c, val) => {
        if (r < 0 || c < 0 || r >= N || c >= N) return;
        m[r][c] = val;
      };

      const placeFinder = (r0, c0) => {
        for (let r = -1; r <= 7; r++) {
          for (let c = -1; c <= 7; c++) {
            const rr = r0 + r;
            const cc = c0 + c;
            if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
            const in7 = r >= 0 && r <= 6 && c >= 0 && c <= 6;
            const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const in3 = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            if (!in7) set(rr, cc, 0);
            else set(rr, cc, onBorder || in3 ? 1 : 0);
          }
        }
      };

      placeFinder(0, 0);
      placeFinder(0, N - 7);
      placeFinder(N - 7, 0);

      // timing patterns
      for (let i = 8; i <= N - 9; i++) {
        set(6, i, i % 2 === 0 ? 1 : 0);
        set(i, 6, i % 2 === 0 ? 1 : 0);
      }

      // dark module
      set(13, 8, 1);

      const isReserved = (r, c) => {
        if (r === 6 || c === 6) return true;
        const inTL = r <= 8 && c <= 8;
        const inTR = r <= 8 && c >= N - 9;
        const inBL = r >= N - 9 && c <= 8;
        if (inTL || inTR || inBL) return true;
        if (r === 13 && c === 8) return true;
        // format info areas
        if (r === 8 || c === 8) {
          if (!(r === 8 && c === 8)) return true;
        }
        return false;
      };

      // ✅ Byte mode (0100)
      // Version 1-L รองรับ ~17 bytes (เพื่อไม่ให้ overflow)
      const bytes = Array.from(v, (ch) => ch.charCodeAt(0) & 0xff).slice(0, 17);

      const bits = [];
      const pushBits = (num, len) => {
        for (let i = len - 1; i >= 0; i--) bits.push((num >> i) & 1);
      };

      pushBits(0b0100, 4); // mode
      pushBits(bytes.length, 8); // count
      for (let i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);

      const maxDataBits = 19 * 8;
      const remainBits = maxDataBits - bits.length;
      if (remainBits > 0) pushBits(0, Math.min(4, remainBits));
      while (bits.length % 8 !== 0) bits.push(0);

      const data = [];
      for (let i = 0; i < bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
        data.push(b);
      }

      // pad bytes
      while (data.length < 19) data.push(data.length % 2 === 0 ? 0xec : 0x11);

      const ecc = rsEncode(data);
      const codewords = [...data, ...ecc];

      const stream = [];
      codewords.forEach((cw) => {
        for (let i = 7; i >= 0; i--) stream.push((cw >> i) & 1);
      });

      // place data (mask 0)
      let bitIdx = 0;
      let col = N - 1;
      let dirUp = true;
      const mask0 = (r, c) => ((r + c) % 2 === 0 ? 1 : 0);

      while (col > 0) {
        if (col === 6) col--; // skip timing col
        for (let rowStep = 0; rowStep < N; rowStep++) {
          const r = dirUp ? N - 1 - rowStep : rowStep;
          for (let dc = 0; dc < 2; dc++) {
            const c = col - dc;
            if (isReserved(r, c)) continue;
            const bit = stream[bitIdx++] ?? 0;
            set(r, c, bit ^ mask0(r, c));
          }
        }
        col -= 2;
        dirUp = !dirUp;
      }

      // format info: EC=L (01) + mask0 (000) => 01000
      const formatData = 0b01000;
      const bch15_5 = (val) => {
        let v2 = val << 10;
        const poly = 0x537;
        for (let i = 14; i >= 10; i--) {
          if ((v2 >> i) & 1) v2 ^= poly << (i - 10);
        }
        return (((val << 10) | (v2 & 0x3ff)) ^ 0x5412) & 0x7fff;
      };
      const fmt = bch15_5(formatData);
      const fmtBits = [];
      for (let i = 14; i >= 0; i--) fmtBits.push((fmt >> i) & 1);

      const coordsA = [
        [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
        [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
      ];
      const coordsB = [
        [N - 1, 8], [N - 2, 8], [N - 3, 8], [N - 4, 8], [N - 5, 8], [N - 6, 8], [N - 7, 8],
        [8, N - 8], [8, N - 7], [8, N - 6], [8, N - 5], [8, N - 4], [8, N - 3], [8, N - 2], [8, N - 1],
      ];

      coordsA.forEach(([r, c], i) => set(r, c, fmtBits[i]));
      coordsB.forEach(([r, c], i) => set(r, c, fmtBits[i]));

      // fill remaining
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (m[r][c] === null) m[r][c] = 0;
        }
      }

      return m;
    }, [v, rsEncode]);

    const N = 21;
    const quiet = 4;
    const total = N + quiet * 2; // 29

    const target = Math.max(28, Number(size) || 110);
    // ✅ “โมดูลต้องเป็นจำนวนเต็ม” เพื่อกันเบลอ/สแกนไม่ติด
    const modulePx = Math.max(1, Math.round(target / total));
    const px = modulePx * total;

    const rects = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (matrix[r][c] === 1) {
          rects.push(
            <rect
              key={r + '-' + c}
              x={(c + quiet) * modulePx}
              y={(r + quiet) * modulePx}
              width={modulePx}
              height={modulePx}
              fill="#000"
            />
          );
        }
      }
    }

    return (
      <svg
        width={px}
        height={px}
        viewBox={'0 0 ' + px + ' ' + px}
        role="img"
        aria-label="QR Code"
        shapeRendering="crispEdges"
        style={{ display: 'block' }}
      >
        <rect x="0" y="0" width={px} height={px} fill="#fff" />
        {rects}
      </svg>
    );
  };

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
    const { barcodes, loadBarcodesAction, markBarcodeAsPrintedAction, clearErrorAction: clearBarcodeErrorAction } = useBarcodeStore();
    const { markReceiptAsPrintedAction, clearErrorAction: clearReceiptErrorAction } = usePurchaseOrderReceiptStore();

    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // ✅ Prevent double-fetch (React 18 StrictMode / state re-render) — production-safe
    // - กันยิงซ้ำ 2 รอบแบบที่เห็นใน log (by-receipt ถูกเรียกซ้ำ)
    // - อนุญาต reload ได้เมื่อผู้ใช้กด “โหลดอีกครั้ง” หรือหลัง confirm printed
    const inFlightLoadRef = useRef(false);
    const lastLoadedKeyRef = useRef(null);

    // ✅ UI-based error (no dialog)
    const [uiError, setUiError] = useState('');

    // ✅ Print Batch Stamp (audit-friendly): กัน “พิมพ์ผิดใบ/ปะปนงาน” แบบสุดท้าย
    // - แสดงในกระดาษ (print-only) เป็นลายน้ำ/ข้อความจาง ๆ
    // - ผูกกับ receiptId + timestamp + nonce เพื่อ trace กลับได้
    const [printStamp, setPrintStamp] = useState('');
    const lastStampReceiptRef = useRef(null);

    // ✅ Print guard: ต้องกดพิมพ์อย่างน้อย 1 ครั้งก่อน “ยืนยันพิมพ์แล้ว”
    const [hasTriggeredPrint, setHasTriggeredPrint] = useState(false);
    const hasTriggeredPrintRef = useRef(false);

    // ✅ Zero Human Error (optional): auto-confirm หลังจากปิดหน้าพิมพ์ (afterprint)
    // - ค่าเริ่มต้นเปิด เพื่อให้ flow โรงงาน: กดพิมพ์ → ปิดหน้าพิมพ์ → ระบบ mark printed
    const [autoConfirmAfterPrint, setAutoConfirmAfterPrint] = useState(true);
    const autoConfirmAfterPrintRef = useRef(true);

    // keep refs fresh
    useEffect(() => {
      hasTriggeredPrintRef.current = !!hasTriggeredPrint;
    }, [hasTriggeredPrint]);

    useEffect(() => {
      autoConfirmAfterPrintRef.current = !!autoConfirmAfterPrint;
    }, [autoConfirmAfterPrint]);

    // ✅ โหมดพิมพ์ (Production): ใช้ font-only (Code39) เท่านั้น
    // เหตุผล: สินค้าชิ้นเล็ก → ต้องย่อได้มากและยังสแกนเสถียร
    const [fontScaleX, setFontScaleX] = useState(1.1);

    // ✅ กันพฤติกรรมไม่สม่ำเสมอของ Chrome Print Preview (บางเครื่อง/บางไดรเวอร์อาจไม่ apply transform: scaleX)
    // เราจะ “ตรึงโหมดพิมพ์” ให้ใช้ความกว้างแบบไม่พึ่ง transform เพื่อให้ชื่อสินค้าไม่ล้นบาร์โค้ดในหน้า Before Print
    const [isPrinting, setIsPrinting] = useState(false);
    const [fontSizePx, setFontSizePx] = useState(30);

    // ✅ Toggle โหมดพิมพ์: Barcode / QR (default: barcode only)
    // - ค่าเริ่มต้น: ปิด QR เสมอ (ผู้ใช้เป็นคนเลือก)
    // - รองรับ: ปิด Barcode เพื่อพิมพ์ QR อย่างเดียว
    const [showBarcode, setShowBarcode] = useState(true);
    const [showQr, setShowQr] = useState(false);
    const [qrSizePx, setQrSizePx] = useState(100);

    // ✅ “นิ่งสุดของจริง”: ป้องกันพิมพ์ซ้ำโดย default (ต้องจงใจเปิดเอง)
    const [includePrinted, setIncludePrinted] = useState(false);

    // ✅ Barcode sanity check (Code39): กันอักขระต้องห้าม/ภาษาไทย
    const isValidCode39 = useCallback((raw) => {
      const s = (raw ?? '').toString().trim();
      if (!s) return false;
      // Code39 (basic set): 0-9 A-Z space - . $ / + %
      // NOTE: เราวาดด้วยฟอนต์ Code39 โดยครอบ * เองอยู่แล้ว
      return /^[0-9A-Z\-\. \$\/\+%]+$/.test(s);
    }, []);

    // ✅ Option Guard for QR Size (production-safe)
    // - กัน NaN/ค่าว่าง
    // - บังคับช่วงให้สแกนได้จริงและไม่กินพื้นที่ label เกินจำเป็น
    const clampQrSize = (value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return 100;

      // min = 80px  (เล็กกว่านี้เริ่มสแกนยาก)
      // max = 200px (ใหญ่เกินไปจะกินพื้นที่ label)
      return Math.min(200, Math.max(80, num));
    };

    // ✅ จำนวนคอลัมน์ (GRID)
    const [columns, setColumns] = useState(5);

    // ✅ Persist user settings (UX Pro)
    const SETTINGS_KEY = 'pos_barcode_preview_settings_v1';
    // (ลบแล้ว) effectiveBarcodeHeight / barcodeHeight — ใช้ font-only ไม่ต้องคุมความสูงด้วย state แยก

    // ✅ คุมความกว้าง “ชื่อสินค้า” ให้ไม่เกินบาร์โค้ด (Production-friendly)
    // หมายเหตุ: หลีกเลี่ยงการวัด DOM เพราะ print preview ของ Chrome/Windows มัก scale/layout ต่างจากหน้าเว็บ
    // ใช้การประมาณความกว้างจากจำนวนตัวอักษร + fontSize + scale แทน เพื่อให้ผลนิ่งทั้งหน้า Preview และหน้า Print
    const getApproxBarcodeWidthPx = useCallback(
      (barcode) => {
        const text = (barcode || '').toString();

        // ✅ ถ้าปิด Barcode (พิมพ์เฉพาะ QR) → ใช้ความกว้างตาม QR เป็นหลัก
        if (!showBarcode) {
          return Math.max(48, Number(qrSizePx) || 48);
        }

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
      [fontSizePx, fontScaleX, isPrinting, showBarcode, qrSizePx]
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

    // ✅ Filter “printed already” by default (ลดความเสี่ยงพิมพ์ซ้ำ)
    const expandedBarcodesSafe = useMemo(() => {
      const list = Array.isArray(expandedBarcodes) ? expandedBarcodes : [];
      return includePrinted ? list : list.filter((it) => !it?.printed);
    }, [expandedBarcodes, includePrinted]);

    // โหลดข้อมูลอัตโนมัติครั้งแรก และกันกดซ้ำ
    const handleLoadBarcodes = useCallback(async () => {
      if (!receiptId) return;

      const rid = Number.isFinite(Number(receiptId)) ? Number(receiptId) : receiptId;
      const loadKey = `receipt:${rid}`;

      // ✅ hard guard: กันยิงซ้ำซ้อน (รวม StrictMode)
      if (inFlightLoadRef.current) return;

      // ✅ soft guard: ถ้าโหลด key เดิมสำเร็จแล้ว และไม่ได้สั่ง reload → ไม่ต้องยิงซ้ำ
      // NOTE: ผู้ใช้ยังสามารถกดปุ่ม “โหลดอีกครั้ง” เพื่อ reload ได้ (ปุ่มจะเรียกฟังก์ชันนี้โดยตรง)
      if (loaded && lastLoadedKeyRef.current === loadKey) return;

      setUiError('');
      clearBarcodeErrorAction?.();
      clearReceiptErrorAction?.();

      inFlightLoadRef.current = true;
      setLoading(true);
      try {
        await loadBarcodesAction(rid);
        lastLoadedKeyRef.current = loadKey;
        setLoaded(true);
      } catch (err) {
        console.error('❌ loadBarcodesAction failed:', err);
        setUiError(err?.message || err?.response?.data?.message || 'โหลดบาร์โค้ดไม่สำเร็จ');
        setLoaded(false);
      } finally {
        setLoading(false);
        inFlightLoadRef.current = false;
      }
    }, [receiptId, loaded, loadBarcodesAction, clearBarcodeErrorAction, clearReceiptErrorAction]);

    useEffect(() => {
      // ✅ Auto-load once per receiptId (ไม่ยิงซ้ำ)
      if (!receiptId) return;
      if (loaded || loading) return;
      handleLoadBarcodes();
    }, [receiptId, loaded, loading, handleLoadBarcodes]);

    // ✅ Load persisted settings once
    useEffect(() => {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (typeof s?.columns === 'number') setColumns(Math.max(1, Math.min(12, s.columns)));
        if (typeof s?.fontScaleX === 'number') setFontScaleX(Math.max(0.6, Math.min(1.6, s.fontScaleX)));
        if (typeof s?.fontSizePx === 'number') setFontSizePx(Math.max(14, Math.min(60, s.fontSizePx)));
        if (typeof s?.showBarcode === 'boolean') setShowBarcode(s.showBarcode);
        if (typeof s?.showQr === 'boolean') setShowQr(s.showQr);
        if (typeof s?.qrSizePx === 'number') setQrSizePx(clampQrSize(s.qrSizePx));
        if (typeof s?.useSuggested === 'boolean') setUseSuggested(s.useSuggested);
        if (typeof s?.autoConfirmAfterPrint === 'boolean') setAutoConfirmAfterPrint(s.autoConfirmAfterPrint);
      } catch {
        // ignore
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ✅ Persist settings when changed
    useEffect(() => {
      try {
        const payload = {
          columns,
          fontScaleX,
          fontSizePx,
          showBarcode,
          showQr,
          qrSizePx,
          useSuggested,
          autoConfirmAfterPrint,
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
      } catch {
        // ignore
      }
    }, [columns, fontScaleX, fontSizePx, showBarcode, showQr, qrSizePx, useSuggested, autoConfirmAfterPrint]);

    // ✅ Detect print mode (beforeprint/afterprint + matchMedia('print')) เพื่อให้ layout ในหน้า Before Print ไม่เพี้ยน
    useEffect(() => {
      const onBeforePrint = () => {
        // ✅ generate/refresh print stamp per receipt
        try {
          const rid = receiptId || '-';
          const needNew = !printStamp || lastStampReceiptRef.current !== rid;
          if (needNew) {
            const now = new Date();
            const ts = now.toISOString().replace('T', ' ').slice(0, 19);
            const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
            setPrintStamp(`RECEIPT:${rid} | PRINT:${ts} | ${nonce}`);
            lastStampReceiptRef.current = rid;
          }
        } catch {
          // ignore
        }

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

        // ✅ Zero Human Error: auto confirm after print (optional)
        // NOTE: เราไม่สามารถพิสูจน์ได้ว่าเครื่องพิมพ์ออกจริง 100% แต่ afterprint ช่วยลด human error ได้มาก
        if (autoConfirmAfterPrintRef.current && hasTriggeredPrintRef.current) {
          // run async without blocking UI thread
          Promise.resolve().then(() => handleConfirmPrinted({ skipPrintGuard: true }));
        }
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
      if (!loaded || expandedBarcodesSafe.length === 0) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    }, [loaded, expandedBarcodesSafe.length, fontSizePx, fontScaleX, isPrinting, columns, measureBarcodeWidths]);

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
    }, [loaded, expandedBarcodesSafe.length, measureBarcodeWidths]);

    const handlePrint = () => {
      if (!loaded || expandedBarcodesSafe.length === 0) return;
      setUiError('');

      // ✅ Hard guard: ต้องเลือกอย่างน้อย 1 โหมด
      if (!showBarcode && !showQr) {
        setUiError('ต้องเลือกอย่างน้อย 1 รูปแบบการพิมพ์ (บาร์โค้ด หรือ QR)');
        return;
      }

      // ✅ Sanity check ก่อนพิมพ์: กัน barcode invalid ที่สแกนไม่ได้/ฟอนต์วาดไม่ได้
      const invalid = expandedBarcodesSafe.filter((it) => !isValidCode39(it?.barcode));
      if (invalid.length > 0) {
        const sample = invalid.slice(0, 3).map((x) => (x?.barcode ?? '').toString()).join(', ');
        setUiError(`พบ Barcode ไม่ถูกต้องตามมาตรฐาน Code39 จำนวน ${invalid.length} รายการ (ตัวอย่าง: ${sample})`);
        return;
      }

      // ✅ mark that user initiated print
      setHasTriggeredPrint(true);

      try {
        window.print();
      } catch (err) {
        console.error('❌ window.print failed:', err);
        setUiError('ไม่สามารถเปิดหน้าพิมพ์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    };

    const handleConfirmPrinted = async (opts = {}) => {
      const { skipPrintGuard = false } = opts;
      setUiError('');

      try {
        if (!receiptId || barcodes.length === 0) return;

        // ✅ Safety lock: ต้องพิมพ์ก่อนยืนยัน (กันคนกดผิด)
        if (!skipPrintGuard && !hasTriggeredPrintRef.current) {
          setUiError('กรุณากด “พิมพ์บาร์โค้ด” ก่อน แล้วค่อยกด “ยืนยันพิมพ์แล้ว”');
          return;
        }

        const rid = Number.isFinite(Number(receiptId)) ? Number(receiptId) : receiptId;

        const hasUnprinted = barcodes.some((b) => !b.printed);
        if (hasUnprinted) {
          await markBarcodeAsPrintedAction({ purchaseOrderReceiptId: rid });
        }

        await markReceiptAsPrintedAction(rid);

        // ✅ reset guard after successful confirm
        setHasTriggeredPrint(false);

        // ✅ refresh state so UI reflects printed
        lastLoadedKeyRef.current = null;
        setLoaded(false);
      } catch (err) {
        console.error('❌ อัปเดตสถานะ printed ล้มเหลว:', err);
        setUiError(err?.message || err?.response?.data?.message || 'อัปเดตสถานะพิมพ์ไม่สำเร็จ');
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
    margin-bottom: 1px; /* 🔧 ลดช่องว่างระหว่างชื่อสินค้า กับ บาร์โค้ด */
    text-align: center;

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
            align-items: center;
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

          /* ✅ ตัด human-readable digits ที่ฝังมากับบาง Code39 fonts (ให้เหมือน PrintBarcodeBatchPage) */
          .barcode-bars-only {
            overflow: hidden;
            /* 🔧 เพิ่มความสูงเพื่อให้ human-readable digits แสดงครบ (ไม่ถูกตัด) */
            height: calc(var(--barcode-font-size, 30px) * 1.05);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            width: 100%;
          }

          /* ✅ กันตัวบาร์ (transform/font glyph) ล้ำขึ้นไปซ้อนชื่อสินค้า */
          .barcode-bars-wrap {
            position: relative;
            z-index: 1;
            padding-top: 0px; /* 🔧 ลดระยะห่างด้านบนของบาร์โค้ดให้ชิดขึ้น */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
          }

          @media print {
            /* ✅ Print batch stamp (audit) */
            .print-stamp {
              position: fixed;
              top: 2mm;
              left: 2mm;
              font-size: 9px;
              letter-spacing: 0.3px;
              opacity: 0.35;
              color: #000;
              z-index: 9999;
              pointer-events: none;
              user-select: none;
              white-space: nowrap;
            }
            .print-stamp.bottom {
              top: auto;
              bottom: 2mm;
            }


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
          {/* ✅ Print-only audit stamp (top + bottom) */}
          <div className="print-stamp hidden print:block">{printStamp || `RECEIPT:${receiptId || '-'} | PRINT:-`}</div>
          <div className="print-stamp bottom hidden print:block">{printStamp || `RECEIPT:${receiptId || '-'} | PRINT:-`}</div>
          <h1 className="text-xl font-bold print:hidden">พรีวิวบาร์โค้ด</h1>

          {/* ✅ Context + Summary (ลด human error) */}
          <div className="print:hidden rounded-lg border bg-white px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <div><span className="text-gray-600">Receipt:</span> <span className="font-semibold">#{receiptId || '-'}</span></div>
              <div className="hidden md:block"><span className="text-gray-600">Stamp:</span> <span className="font-semibold">{printStamp ? printStamp : '-'}</span></div>
              <div><span className="text-gray-600">Labels:</span> <span className="font-semibold">{expandedBarcodesSafe.length}</span></div>
              <div>
                <span className="text-gray-600">Printed:</span>{' '}
                <span className="font-semibold">{barcodes.filter((b) => b.printed).length} / {barcodes.length}</span>
              </div>
              <div>
                <span className="text-gray-600">สถานะยืนยัน:</span>{' '}
                <span className={hasTriggeredPrint ? 'font-semibold text-emerald-700' : 'font-semibold text-gray-700'}>
                  {hasTriggeredPrint ? 'พิมพ์แล้ว (พร้อมยืนยัน)' : 'ยังไม่ได้พิมพ์'}
                </span>
              </div>
            </div>
          </div>

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

              {/* ✅ ผู้ใช้เลือกได้: พิมพ์ Barcode / พิมพ์ QR / หรือพิมพ์เฉพาะ QR */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setShowBarcode(next);
                    // ถ้าปิด Barcode แล้ว และยังไม่ได้เปิด QR → เปิด QR ให้อัตโนมัติ
                    if (!next && !showQr) setShowQr(true);
                  }}
                />
                พิมพ์บาร์โค้ด
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showQr}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setShowQr(next);
                    // ถ้าปิด QR แล้ว และยังไม่ได้เปิด Barcode → เปิด Barcode ให้อัตโนมัติ
                    if (!next && !showBarcode) setShowBarcode(true);
                  }}
                />
                พิมพ์ QR Code
              </label>

              <label className="flex items-center gap-2">
                ขนาด QR:
                <input
                  type="number"
                  value={qrSizePx}
                  onChange={(e) => setQrSizePx(clampQrSize(e.target.value))}
                  onBlur={(e) => setQrSizePx(clampQrSize(e.target.value))}
                  className="w-20 border rounded px-2 py-1"
                  min={80}
                  max={200}
                  step={1}
                />
              </label>


              <label className="flex items-center gap-2">
                <input type="checkbox" checked={useSuggested} onChange={(e) => setUseSuggested(e.target.checked)} />
                พิมพ์ตามจำนวนรับ (SIMPLE)
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoConfirmAfterPrint}
                  onChange={(e) => setAutoConfirmAfterPrint(e.target.checked)}
                />
                ยืนยันอัตโนมัติหลังพิมพ์
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includePrinted}
                  onChange={(e) => setIncludePrinted(e.target.checked)}
                />
                รวมรายการที่พิมพ์แล้ว
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
                disabled={!loaded || expandedBarcodesSafe.length === 0}
              >
                พิมพ์บาร์โค้ด
              </button>

              <button
                onClick={handleConfirmPrinted}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                disabled={!loaded || expandedBarcodesSafe.length === 0}
              >
                ยืนยันพิมพ์แล้ว
              </button>
            </div>
          </div>

          {uiError ? (
            <div className="print:hidden rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <div className="font-semibold">เกิดข้อผิดพลาด</div>
              <div className="mt-1 break-words">{uiError}</div>
              <button
                type="button"
                className="mt-2 text-xs text-gray-700 underline"
                onClick={() => setUiError('')}
              >
                ปิดข้อความ
              </button>
            </div>
          ) : null}

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
              {expandedBarcodesSafe.map((item) => {
                const rowKey = `${item.id || item.barcode}-${item._dupIdx ?? 0}`;

                const validC39 = isValidCode39(item?.barcode);
                const cellOpacity = validC39 ? 1 : 0.65;

                const measuredW = Number(barcodeWidthMap[rowKey] || 0);
                const approxW = getApproxBarcodeWidthPx(item.barcode);
                const finalW = Math.max(48, measuredW > 0 ? measuredW : approxW);

                const displayName = getListDisplayNameByWidth(item, finalW);

                return (
                  <div
                    key={rowKey}
                    className={`barcode-cell border p-0.5 rounded text-left flex flex-col items-start justify-start relative ${validC39 ? '' : 'border-rose-300 bg-rose-50'}`}
                    style={{ opacity: cellOpacity }}
                  >
                    {item.printed ? (
                      <div className="absolute right-1 top-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        PRINTED
                      </div>
                    ) : null}

                    {!validC39 ? (
                      <div className="absolute left-1 top-1 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        INVALID
                      </div>
                    ) : null}

                    <div className="barcode-block" style={{ width: `${finalW}px`, maxWidth: `${finalW}px` }}>
                      <div className="barcode-product-name" title={item.productName || ''}>
                        {displayName}
                      </div>

                      <div className="barcode-bars-wrap">
                        {showBarcode ? (
                          <div className="barcode-bars-only" style={{ "--barcode-font-size": `${fontSizePx}px` }}>
                            <div
                              ref={setBarcodeElRef(rowKey)}
                              className="c39-barcode"
                              style={{
                                fontSize: `${fontSizePx}px`,
                                lineHeight: 1,
                                transform: isPrinting ? 'none' : `scaleX(${fontScaleX})`,
                                transformOrigin: 'center top',
                                display: 'inline-block',
                                marginTop: '0px',
                              }}
                            >
                              *{(item.barcode || '').toString().trim().toUpperCase()}*
                            </div>
                          </div>
                        ) : null}

                        {showQr ? (
                          <div
                            style={{
                              marginTop: showBarcode ? '4px' : '0px',
                              display: 'flex',
                              justifyContent: 'center',
                              width: '100%',
                            }}
                          >
                            <QrSvg value={(item.barcode || '').toString().trim().toUpperCase()} size={clampQrSize(qrSizePx)} />
                          </div>
                        ) : null}
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










