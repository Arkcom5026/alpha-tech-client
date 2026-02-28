



  

// src/features/barcode/pages/PrintBarcodeBatchPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useBarcodeStore from "@/features/barcode/store/barcodeStore";
import c39FontUrl from "@/assets/fonts/c39hrp24dhtt.ttf?url";

// ✅ Tiny QR (Version 1-L, EC=L, Mask 0) — no external deps
// (copy from PreviewBarcodePage เพื่อให้สแกน/พิมพ์นิ่งเหมือนกัน)
const QrSvg = ({ value, size = 100 }) => {
  const v = (value ?? "").toString().trim();

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

  const rsEncode = React.useCallback(
    (dataCw) => {
      const gen = [87, 229, 146, 149, 238, 102, 21];
      const ecc = new Array(7).fill(0);
      for (let i = 0; i < dataCw.length; i++) {
        const factor = dataCw[i] ^ ecc[0];
        for (let j = 0; j < 6; j++) ecc[j] = ecc[j + 1];
        ecc[6] = 0;
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

    for (let i = 8; i <= N - 9; i++) {
      set(6, i, i % 2 === 0 ? 1 : 0);
      set(i, 6, i % 2 === 0 ? 1 : 0);
    }

    set(13, 8, 1);

    const isReserved = (r, c) => {
      if (r === 6 || c === 6) return true;
      const inTL = r <= 8 && c <= 8;
      const inTR = r <= 8 && c >= N - 9;
      const inBL = r >= N - 9 && c <= 8;
      if (inTL || inTR || inBL) return true;
      if (r === 13 && c === 8) return true;
      if (r === 8 || c === 8) {
        if (!(r === 8 && c === 8)) return true;
      }
      return false;
    };

    const bytes = Array.from(v, (ch) => ch.charCodeAt(0) & 0xff).slice(0, 17);

    const bits = [];
    const pushBits = (num, len) => {
      for (let i = len - 1; i >= 0; i--) bits.push((num >> i) & 1);
    };

    pushBits(0b0100, 4);
    pushBits(bytes.length, 8);
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

    while (data.length < 19) data.push(data.length % 2 === 0 ? 0xec : 0x11);

    const ecc = rsEncode(data);
    const codewords = [...data, ...ecc];

    const stream = [];
    codewords.forEach((cw) => {
      for (let i = 7; i >= 0; i--) stream.push((cw >> i) & 1);
    });

    let bitIdx = 0;
    let col = N - 1;
    let dirUp = true;
    const mask0 = (r, c) => ((r + c) % 2 === 0 ? 1 : 0);

    while (col > 0) {
      if (col === 6) col--;
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
      [8, 0],
      [8, 1],
      [8, 2],
      [8, 3],
      [8, 4],
      [8, 5],
      [8, 7],
      [8, 8],
      [7, 8],
      [5, 8],
      [4, 8],
      [3, 8],
      [2, 8],
      [1, 8],
      [0, 8],
    ];
    const coordsB = [
      [N - 1, 8],
      [N - 2, 8],
      [N - 3, 8],
      [N - 4, 8],
      [N - 5, 8],
      [N - 6, 8],
      [N - 7, 8],
      [8, N - 8],
      [8, N - 7],
      [8, N - 6],
      [8, N - 5],
      [8, N - 4],
      [8, N - 3],
      [8, N - 2],
      [8, N - 1],
    ];

    coordsA.forEach(([r, c], i) => set(r, c, fmtBits[i]));
    coordsB.forEach(([r, c], i) => set(r, c, fmtBits[i]));

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (m[r][c] === null) m[r][c] = 0;
      }
    }

    return m;
  }, [v, rsEncode]);

  const N = 21;
  const quiet = 4;
  const total = N + quiet * 2;

  const target = Math.max(28, Number(size) || 110);
  const modulePx = Math.max(1, Math.round(target / total));
  const px = modulePx * total;

  const rects = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (matrix[r][c] === 1) {
        rects.push(
          <rect
            key={r + "-" + c}
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
      viewBox={"0 0 " + px + " " + px}
      role="img"
      aria-label="QR Code"
      shapeRendering="crispEdges"
      style={{ display: "block" }}
    >
      <rect x="0" y="0" width={px} height={px} fill="#fff" />
      {rects}
    </svg>
  );
};

// ✅ Helpers
const parseIds = (raw) => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((x) => Number.isFinite(x));
};

const isValidCode39 = (raw) => {
  const s = (raw ?? "").toString().trim().toUpperCase();
  if (!s) return false;
  return /^[0-9A-Z\-\. \$\/\+%]+$/.test(s);
};


const clampQrSize = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 100;
  return Math.min(200, Math.max(80, num));
};



const PrintBarcodeBatchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const barcodeStore = useBarcodeStore();

  // ✅ Store (รองรับหลายชื่อ action เพื่อกันชื่อไม่ตรง)
  const fetchBarcodesByReceiptIdAction =
    barcodeStore?.fetchBarcodesByReceiptIdAction ||
    barcodeStore?.loadBarcodesByReceiptIdAction ||
    barcodeStore?.getBarcodesByReceiptIdAction ||
    barcodeStore?.loadBarcodeReceiptItemsAction ||
    barcodeStore?.fetchBarcodeReceiptItemsAction ||
    barcodeStore?.getBarcodeReceiptItemsAction;

  // ✅ Fast path (ยิงครั้งเดียวสำหรับหลายใบ)
  // Expected endpoint: GET /api/barcodes/print-batch?ids=458,451
  const fetchPrintBatchAction =
    barcodeStore?.fetchPrintBatchAction ||
    barcodeStore?.fetchBarcodesForPrintBatchAction ||
    barcodeStore?.getBarcodesForPrintBatchAction ||
    barcodeStore?.loadPrintBatchAction;

  const markBarcodeAsPrintedAction =
    barcodeStore?.markBarcodeAsPrintedAction ||
    barcodeStore?.confirmBarcodesPrintedAction ||
    barcodeStore?.confirmBarcodePrintedAction ||
    barcodeStore?.markBarcodesPrintedAction;

  const markReceiptAsPrintedAction =
    barcodeStore?.markReceiptAsPrintedAction ||
    barcodeStore?.confirmReceiptPrintedAction ||
    barcodeStore?.markReceiptPrintedAction;

  const generateBarcodesAction =
    barcodeStore?.generateBarcodesAction ||
    barcodeStore?.generateMissingBarcodesAction ||
    barcodeStore?.generateMissingByReceiptIdAction;

  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const ids = useMemo(() => parseIds(qs.get("ids")), [qs]);
  // ✅ Stable key for effects (avoid TDZ / strict-mode quirks)
  const idsKey = useMemo(() => `ids:${ids.join(",")}`, [ids]);

  // ✅ UI state
  const [uiError, setUiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // ✅ Settings (ให้มาตรฐานเดียวกับ Preview)
  const [columns, setColumns] = useState(5);
  const [fontScaleX, setFontScaleX] = useState(1.1);
  const [fontSizePx, setFontSizePx] = useState(30);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [qrSizePx, setQrSizePx] = useState(100);
  const [includePrinted, setIncludePrinted] = useState(false);

  // ✅ Print guard
  const [hasTriggeredPrint, setHasTriggeredPrint] = useState(false);
  const hasTriggeredPrintRef = useRef(false);
  useEffect(() => {
    hasTriggeredPrintRef.current = !!hasTriggeredPrint;
  }, [hasTriggeredPrint]);

  const [autoConfirmAfterPrint, setAutoConfirmAfterPrint] = useState(true);
  const autoConfirmAfterPrintRef = useRef(true);
  useEffect(() => {
    autoConfirmAfterPrintRef.current = !!autoConfirmAfterPrint;
  }, [autoConfirmAfterPrint]);

  // ✅ Print mode
  const [isPrinting, setIsPrinting] = useState(false);

  // ✅ Print stamp
  const [printStamp, setPrintStamp] = useState("");
  const lastStampKeyRef = useRef("");

  // ✅ Data state
  const [rows, setRows] = useState([]); // flat list

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.receiptId)) map.set(r.receiptId, []);
      map.get(r.receiptId).push(r);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => (a.barcode || "").localeCompare(b.barcode || ""));
      map.set(k, list);
    }
    return map;
  }, [rows]);

  const receiptSummary = useMemo(() => {
    const out = [];
    for (const receiptId of ids) {
      const list = grouped.get(receiptId) || [];
      const count = list.length;
      const printedCount = list.filter((x) => x.printed).length;
      out.push({ receiptId, count, printedCount });
    }
    return out;
  }, [ids, grouped]);

  const safeRowsByReceipt = useMemo(() => {
    const map = new Map();
    for (const receiptId of ids) {
      const list = grouped.get(receiptId) || [];
      const filtered = includePrinted ? list : list.filter((x) => !x.printed);
      map.set(receiptId, filtered);
    }
    return map;
  }, [ids, grouped, includePrinted]);

  const totalLabels = useMemo(() => {
    let n = 0;
    for (const receiptId of ids) n += (safeRowsByReceipt.get(receiptId) || []).length;
    return n;
  }, [ids, safeRowsByReceipt]);

  // ✅ Performance mode: label เยอะมาก → ลดงาน DOM/measure เพื่อให้ “เร็วขึ้นอีกระดับ”
  const PERF_THRESHOLD = 400; // ปรับได้ตามเครื่องจริง
  const isHeavyBatch = totalLabels >= PERF_THRESHOLD;
  const INITIAL_RENDER = 250;
  const RENDER_STEP = 250;

  // ✅ Flat list (pack all receipts into same page grid)
  const flatItems = useMemo(() => {
    const out = [];
    for (const receiptId of ids) {
      const list = safeRowsByReceipt.get(receiptId) || [];
      for (const it of list) out.push({ ...it, receiptId });
    }
    return out;
  }, [ids, safeRowsByReceipt]);

  // ✅ Progressive render (perceived speed เร็วขึ้นมากเวลา label เยอะ)
  const [renderLimit, setRenderLimit] = useState(0);
  const renderLimitRef = useRef(0);
  useEffect(() => {
    renderLimitRef.current = renderLimit;
  }, [renderLimit]);

  useEffect(() => {
    if (!loaded) {
      setRenderLimit(0);
      return;
    }

    const total = flatItems.length;
    if (total === 0) {
      setRenderLimit(0);
      return;
    }

    // ชุดแรกให้ไว
    setRenderLimit(Math.min(total, INITIAL_RENDER));

    let cancelled = false;
    const schedule = (fn) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 250 });
      else setTimeout(fn, 0);
    };

    const pump = () => {
      if (cancelled) return;
      const cur = renderLimitRef.current || 0;
      if (cur >= total) return;
      const next = Math.min(total, cur + RENDER_STEP);
      setRenderLimit(next);
      schedule(pump);
    };

    schedule(pump);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, idsKey, flatItems.length]);

  const visibleItems = useMemo(() => {
    const limit = renderLimit > 0 ? renderLimit : flatItems.length;
    return flatItems.slice(0, limit);
  }, [flatItems, renderLimit]);

  // ✅ One-line summary (ตามที่ขอ)
  const receiptsInlineLabel = useMemo(() => {
    return ids
      .map((receiptId) => {
        const n = (safeRowsByReceipt.get(receiptId) || []).length;
        return `Receipt: #${receiptId} | Labels: ${n}`;
      })
      .join("   ");
  }, [ids, safeRowsByReceipt]);

  // ✅ Settings persist
  const SETTINGS_KEY = "pos_barcode_batch_settings_v1";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (typeof s?.columns === "number") setColumns(Math.max(1, Math.min(12, s.columns)));
      if (typeof s?.fontScaleX === "number") setFontScaleX(Math.max(0.6, Math.min(1.6, s.fontScaleX)));
      if (typeof s?.fontSizePx === "number") setFontSizePx(Math.max(14, Math.min(60, s.fontSizePx)));
      if (typeof s?.showBarcode === "boolean") setShowBarcode(s.showBarcode);
      if (typeof s?.showQr === "boolean") setShowQr(s.showQr);
      if (typeof s?.qrSizePx === "number") setQrSizePx(clampQrSize(s.qrSizePx));
      if (typeof s?.autoConfirmAfterPrint === "boolean") setAutoConfirmAfterPrint(s.autoConfirmAfterPrint);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const payload = {
        columns,
        fontScaleX,
        fontSizePx,
        showBarcode,
        showQr,
        qrSizePx,
        autoConfirmAfterPrint,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [columns, fontScaleX, fontSizePx, showBarcode, showQr, qrSizePx, autoConfirmAfterPrint]);

  // ✅ Name helper (deterministic 2 lines) — reuse logic from Preview
  const getListDisplayNameByWidth = useCallback((item, widthPx) => {
    const raw = (item?.productName || "").toString().trim();
    if (!raw) return "ชื่อสินค้าไม่พบ";

    const w = Math.max(48, Number(widthPx) || 0);

    const NAME_FONT_PX = 11;
    const AVG_CHAR_PX = NAME_FONT_PX * 0.55;
    const safeW = Math.max(24, w - 6);

    const charsPerLine = Math.max(8, Math.floor(safeW / AVG_CHAR_PX));
    const maxChars = Math.max(16, charsPerLine * 2);

    if (raw.length <= maxChars) return raw;

    const sliced = raw.slice(0, Math.max(0, maxChars - 1)).trim();
    return `${sliced}…`;
  }, []);

  const getApproxBarcodeWidthPx = useCallback(
    (barcode) => {
      const text = (barcode || "").toString();

      if (!showBarcode) {
        return Math.max(48, Number(qrSizePx) || 48);
      }

      const len = Math.max(0, text.length + 2);
      const effectiveScaleX = isPrinting ? 1 : Math.max(0.6, Number(fontScaleX) || 1);
      const k = 0.72;
      const w = Math.round(len * fontSizePx * effectiveScaleX * k);
      return Math.max(48, w);
    },
    [fontSizePx, fontScaleX, isPrinting, showBarcode, qrSizePx]
  );

  // ✅ Measure actual widths (กัน print preview เพี้ยน)
  const barcodeElsRef = useRef(new Map());
  const [barcodeWidthMap, setBarcodeWidthMap] = useState({});

  const setBarcodeElRef = useCallback(
    (key) => (el) => {
      if (!key) return;
      if (el) barcodeElsRef.current.set(key, el);
      else barcodeElsRef.current.delete(key);
    },
    []
  );

  const measureBarcodeWidths = useCallback(() => {
    // ✅ Perf: batch ใหญ่ → ข้ามการวัด width ทีละตัว (หนักมาก)
    if (isHeavyBatch) return;
    const next = {};
    barcodeElsRef.current.forEach((el, key) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect?.width || 0);
      if (w > 0) next[key] = Math.max(48, w);
    });
    setBarcodeWidthMap(next);
  }, [isHeavyBatch]);

  const gridStyle = useMemo(() => {
    const colCount = Math.max(1, Number(columns) || 1);
    return {
      gridTemplateColumns: `repeat(${colCount}, minmax(0, max-content))`,
      justifyContent: "flex-start",
    };
  }, [columns]);

  // ✅ Load guard (กันโหลดซ้ำ/ทับกัน เมื่อเลือกหลายใบหรือกดซ้ำ)
  const inFlightLoadRef = useRef(false);
  const lastLoadKeyRef = useRef("");
  const generatedOnceRef = useRef(new Set());

  const loadAll = useCallback(
    async (opts = {}) => {
      const { force = false } = opts;

      setUiError("");

      if (!ids.length) {
        setUiError("ไม่พบรายการที่เลือกพิมพ์ (ids ว่าง)");
        return;
      }

      if (typeof fetchPrintBatchAction !== "function" && typeof fetchBarcodesByReceiptIdAction !== "function") {
        setUiError("ไม่พบ action สำหรับโหลดบาร์โค้ดใน barcodeStore (print-batch หรือ fetch/load/get ... by receiptId)");
        return;
      }

      const loadKey = `ids:${ids.join(",")}`;
      if (!force && inFlightLoadRef.current) return;
      if (!force && lastLoadKeyRef.current === loadKey && loaded) {
        // same ids set already loaded → skip
        return;
      }

      inFlightLoadRef.current = true;
      lastLoadKeyRef.current = loadKey;

      setLoading(true);
      try {
        // ✅ FAST PATH: โหลดแบบ batch ครั้งเดียว (ชัดเจนว่าเร็วขึ้น)
        // ถ้ามี action ใหม่ → ใช้ก่อน
        let all = [];

        if (typeof fetchPrintBatchAction === "function") {
          const res = await fetchPrintBatchAction(ids, { force });
          const arr = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.barcodes) ? res.barcodes : [];

          // normalize shape ให้เหมือนเดิม
          const dupMap = new Map();
          all = arr.map((it) => {
            const receiptId = Number(it.purchaseOrderReceiptId ?? it.receiptId ?? it.purchaseOrderReceipt?.id ?? 0);
            const key = `${receiptId}`;
            const next = (dupMap.get(key) || 0) + 1;
            dupMap.set(key, next);

            return {
              receiptId,
              id: it.id ?? `${receiptId}-${it.barcode ?? it.code ?? Math.random()}`,
              barcode: (it.barcode ?? it.code ?? "").toString(),
              productName: it.productName ?? it.product?.name ?? it.name ?? "",
              printed: !!it.printed,
              _dupIdx: next - 1,
            };
          });
        } else {
          // ✅ Fallback: โหลดแบบ parallel ต่อ receipt (ของเดิม)
          const tasks = ids.map(async (receiptId) => {
            // ✅ generate-missing เฉพาะครั้งแรกต่อ receipt ใน session (ลดเวลารวม)
            if (typeof generateBarcodesAction === "function") {
              const shouldGenerate = force || !generatedOnceRef.current.has(receiptId);
              if (shouldGenerate) {
                try {
                  await generateBarcodesAction(receiptId);
                  generatedOnceRef.current.add(receiptId);
                } catch {
                  // ignore
                }
              }
            }

            const list = await fetchBarcodesByReceiptIdAction(receiptId);
            const arr = Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : [];

            let dupIdx = 0;
            return arr.map((it) => ({
              receiptId,
              id: it.id ?? `${receiptId}-${it.barcode ?? Math.random()}`,
              barcode: (it.barcode ?? it.code ?? "").toString(),
              productName: it.productName ?? it.product?.name ?? "",
              printed: !!it.printed,
              _dupIdx: dupIdx++,
            }));
          });

          const chunks = await Promise.all(tasks);
          all = chunks.flat();
        }

        setRows(all);
        setLoaded(true);

        // วัดความกว้างหลัง DOM update
        requestAnimationFrame(() => {
          requestAnimationFrame(() => measureBarcodeWidths());
        });

        if (all.length === 0) {
          setUiError("ไม่พบข้อมูลบาร์โค้ดสำหรับรายการที่เลือก");
        }
      } catch (err) {
        console.error(err);
        setUiError(err?.message || err?.response?.data?.message || "โหลดบาร์โค้ดไม่สำเร็จ");
        setLoaded(false);
      } finally {
        setLoading(false);
        inFlightLoadRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ids, fetchPrintBatchAction, fetchBarcodesByReceiptIdAction, generateBarcodesAction, measureBarcodeWidths, loaded]
  );

  // ✅ Auto-load when ids change (StrictMode-safe via inFlightLoadRef)
  useEffect(() => {
    if (!ids.length) return;

    // ✅ รอจน store action พร้อมก่อน (กันค้างแบบไม่มี api call)
    const hasAnyLoader =
      typeof fetchPrintBatchAction === "function" || typeof fetchBarcodesByReceiptIdAction === "function";
    if (!hasAnyLoader) return;

    // ✅ ids เปลี่ยน → force reload รอบเดียว
    loadAll({ force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, fetchPrintBatchAction, fetchBarcodesByReceiptIdAction]);

  // ✅ Detect print mode (beforeprint/afterprint + matchMedia fallback)
  useEffect(() => {
    const onBeforePrint = () => {
      try {
        const key = `ids:${ids.join(",")}`;
        const needNew = !printStamp || lastStampKeyRef.current !== key;
        if (needNew) {
          const now = new Date();
          const ts = now.toISOString().replace("T", " ").slice(0, 19);
          const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
          setPrintStamp(`BATCH:${key} | PRINT:${ts} | ${nonce}`);
          lastStampKeyRef.current = key;
        }
      } catch {
        // ignore
      }

      setIsPrinting(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    };

    const onAfterPrint = () => {
      setIsPrinting(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });

      if (autoConfirmAfterPrintRef.current && hasTriggeredPrintRef.current) {
        Promise.resolve().then(() => handleConfirmPrinted({ skipPrintGuard: true }));
      }
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);

    const mql = window.matchMedia?.("print");
    const onMqlChange = (e) => {
      const printing = !!e?.matches;
      setIsPrinting(printing);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => measureBarcodeWidths());
      });
    };

    if (mql) {
      if (typeof mql.addEventListener === "function") mql.addEventListener("change", onMqlChange);
      else if (typeof mql.addListener === "function") mql.addListener(onMqlChange);
    }

    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);

      if (mql) {
        if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", onMqlChange);
        else if (typeof mql.removeListener === "function") mql.removeListener(onMqlChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, printStamp, measureBarcodeWidths]);

  useEffect(() => {
    if (!loaded) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => measureBarcodeWidths());
    });
  }, [loaded, rows.length, fontSizePx, fontScaleX, isPrinting, columns, measureBarcodeWidths]);

  useEffect(() => {
    if (!loaded) return;

    let cancelled = false;

    const run = async () => {
      try {
        if (document?.fonts?.ready) await document.fonts.ready;
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
  }, [loaded, rows.length, measureBarcodeWidths]);

  const handlePrint = () => {
    setUiError("");

    if (!loaded || totalLabels === 0) return;

    if (!showBarcode && !showQr) {
      setUiError("ต้องเลือกอย่างน้อย 1 รูปแบบการพิมพ์ (บาร์โค้ด หรือ QR)");
      return;
    }

    // ✅ Sanity check (stop print)
    const invalid = rows.filter((it) => {
      if (!includePrinted && it.printed) return false;
      return !isValidCode39(it?.barcode);
    });

    if (invalid.length > 0) {
      const sample = invalid
        .slice(0, 3)
        .map((x) => (x?.barcode ?? "").toString())
        .join(", ");
      setUiError(`พบ Barcode ไม่ถูกต้องตามมาตรฐาน Code39 จำนวน ${invalid.length} รายการ (ตัวอย่าง: ${sample})`);
      return;
    }

    setHasTriggeredPrint(true);

    // ✅ ถ้าเป็น progressive render → เร่ง render ให้ครบก่อน print (กันพิมพ์ออกไม่ครบ)
    if (renderLimit > 0 && renderLimit < flatItems.length) {
      setRenderLimit(flatItems.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            window.print();
          } catch (err) {
            console.error("❌ window.print failed:", err);
            setUiError("ไม่สามารถเปิดหน้าพิมพ์ได้ กรุณาลองใหม่อีกครั้ง");
          }
        });
      });
      return;
    }

    try {
      window.print();
    } catch (err) {
      console.error("❌ window.print failed:", err);
      setUiError("ไม่สามารถเปิดหน้าพิมพ์ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleConfirmPrinted = async (opts = {}) => {
    const { skipPrintGuard = false } = opts;

    setUiError("");

    if (!skipPrintGuard && !hasTriggeredPrintRef.current) {
      setUiError("กรุณากด “พิมพ์บาร์โค้ด” ก่อน แล้วค่อยยืนยันพิมพ์แล้ว");
      return;
    }

    if (typeof markBarcodeAsPrintedAction !== "function" || typeof markReceiptAsPrintedAction !== "function") {
      setUiError("ไม่พบ action สำหรับ mark printed ใน barcodeStore (mark/confirm ... printed)");
      return;
    }

    try {
      for (const receiptId of ids) {
        await markBarcodeAsPrintedAction({ purchaseOrderReceiptId: receiptId });
        await markReceiptAsPrintedAction(receiptId);
      }

      setHasTriggeredPrint(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      setUiError(err?.message || err?.response?.data?.message || "ยืนยันพิมพ์แล้วไม่สำเร็จ");
    }
  };

  if (!ids.length) {
    return (
      <div className="p-6">
        <div className="rounded border bg-white p-4">
          <div className="text-red-600 font-semibold">ไม่พบ ids ใน query</div>
          <button
            className="mt-3 px-3 py-2 rounded bg-blue-600 text-white"
            onClick={() => navigate("/pos/purchases/barcodes")}
          >
            กลับหน้ารายการ
          </button>
        </div>
      </div>
    );
  }

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

        .barcode-product-name {
          position: relative;
          z-index: 2;
          background: #fff;
          padding: 0 1px;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
          font-size: 11px;
          line-height: 12px;
          letter-spacing: 0.4px;
          margin-bottom: 1px;
          text-align: center;
          height: 24px;
          max-height: 24px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
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

        .barcode-cell {
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
          /* Hide human-readable digits embedded in some Code39 fonts */
          height: calc(var(--barcode-font-size, 30px) * 1.05);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
        }

        .barcode-bars-wrap {
          position: relative;
          z-index: 1;
          padding-top: 0px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
        }

        .receipt-block {
          margin-top: 8px;
        }

        /* ✅ Print packing baseline (A4) — lock label size in mm for consistent auto-fill */
          :root {
            --label-w: 38mm;
            --label-h: 22mm;
            --label-gap-x: 2mm;
            --label-gap-y: 1.5mm;
            --print-cols: 5;
          }

          @media print {
            html, body { margin: 0 !important; padding: 0 !important; background: white; }

            .print-hidden { display: none !important; }

            /* ✅ Multi-receipts in same page */
            .receipt-block {
              break-inside: auto;
              page-break-inside: auto;
              margin-top: 0 !important;
            }

            /* ✅ Never split a label cell across pages + lock label size */
            .barcode-cell {
              break-inside: avoid;
              page-break-inside: avoid;
              width: var(--label-w) !important;
              min-width: var(--label-w) !important;
              max-width: var(--label-w) !important;
              min-height: var(--label-h) !important;
              box-sizing: border-box;
            }

            /* ✅ Auto-pack columns based on real page width */
            .print-area {
              display: grid !important;
              grid-template-columns: repeat(var(--print-cols), var(--label-w)) !important;
              column-gap: var(--label-gap-x) !important;
              row-gap: var(--label-gap-y) !important;
              justify-content: flex-start !important;
              justify-items: start !important;
              align-content: start !important;
              align-items: start !important;
              width: 100% !important;
              margin-top: 0 !important;
            }

            .barcode-product-name {
              font-size: 10px !important;
              line-height: 11px !important;
              height: 22px !important;
              max-height: 22px !important;
            }

            /* ✅ tiny safety margin (กันโดน printer non-printable area) */
            @page { margin: 2mm; size: A4; }
          }
      `}</style>

      <div className="p-6 space-y-6 print-root" style={{ "--print-cols": Math.max(1, Number(columns) || 1) }}>
        {/* ✅ Print-only audit stamp */}
        <div className="print-stamp hidden print:block">{printStamp || `BATCH:ids:${ids.join(",")} | PRINT:-`}</div>
        <div className="print-stamp bottom hidden print:block">{printStamp || `BATCH:ids:${ids.join(",")} | PRINT:-`}</div>

        {/* Header */}
        <div className="print-hidden">
          <h1 className="text-xl font-bold">พิมพ์บาร์โค้ด (หลายรายการ)</h1>

          <div className="mt-3 rounded border bg-white px-4 py-3 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
              <div>
                <span className="text-gray-600">IDs:</span> <span className="font-semibold">{ids.join(", ")}</span>
              </div>
              <div>
                <span className="text-gray-600">Labels:</span> <span className="font-semibold">{totalLabels}</span>
              </div>
              <div className="hidden md:block">
                <span className="text-gray-600">Stamp:</span> <span className="font-semibold">{printStamp || "-"}</span>
              </div>
            </div>

            {receiptSummary.length ? (
              <div className="mt-2 text-xs text-gray-600 whitespace-nowrap overflow-x-auto">
                {receiptsInlineLabel}
              </div>
            ) : null}
          </div>

          {uiError ? (
            <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <div className="font-semibold">เกิดข้อผิดพลาด</div>
              <div className="mt-1 break-words">{uiError}</div>
              <button type="button" className="mt-2 text-xs text-gray-700 underline" onClick={() => setUiError("")}
              >
                ปิดข้อความ
              </button>
            </div>
          ) : null}

          {/* Controls */}
          <div className="mt-3 flex flex-wrap gap-3 items-center">
            <label className="flex items-center gap-2">
              คอลัมน์:
              <input
                className="w-16 border rounded px-2 py-1"
                type="number"
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value || 1))}
                min={1}
                max={12}
                step={1}
              />
            </label>

            <label className="flex items-center gap-2">
              ความกว้างฟอนต์:
              <input
                className="w-20 border rounded px-2 py-1"
                type="number"
                step="0.1"
                value={fontScaleX}
                onChange={(e) => setFontScaleX(Number(e.target.value || 1.1))}
                min={0.6}
                max={1.6}
              />
            </label>

            <label className="flex items-center gap-2">
              ขนาดฟอนต์:
              <input
                className="w-20 border rounded px-2 py-1"
                type="number"
                value={fontSizePx}
                onChange={(e) => setFontSizePx(Number(e.target.value || 30))}
                min={14}
                max={60}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={(e) => {
                  const next = e.target.checked;
                  setShowBarcode(next);
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
                  if (!next && !showBarcode) setShowBarcode(true);
                }}
              />
              พิมพ์ QR
            </label>

            <label className="flex items-center gap-2">
              ขนาด QR:
              <input
                className="w-20 border rounded px-2 py-1"
                type="number"
                value={qrSizePx}
                onChange={(e) => setQrSizePx(clampQrSize(e.target.value))}
                onBlur={(e) => setQrSizePx(clampQrSize(e.target.value))}
                min={80}
                max={200}
              />
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={includePrinted} onChange={(e) => setIncludePrinted(e.target.checked)} />
              รวมรายการที่พิมพ์แล้ว
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoConfirmAfterPrint}
                onChange={(e) => setAutoConfirmAfterPrint(e.target.checked)}
              />
              ยืนยันอัตโนมัติหลังพิมพ์
            </label>

            <button className="px-3 py-2 rounded bg-blue-600 text-white" disabled={loading} onClick={() => loadAll({ force: true })}>
              {loading ? "กำลังโหลด..." : loaded ? "โหลดอีกครั้ง" : "โหลด"}
            </button>

            <button
              className="px-3 py-2 rounded bg-emerald-600 text-white"
              disabled={loading || !loaded || totalLabels === 0}
              onClick={handlePrint}
            >
              พิมพ์บาร์โค้ด
            </button>

            <button
              className="px-3 py-2 rounded bg-emerald-700 text-white"
              disabled={loading || !loaded || totalLabels === 0}
              onClick={() => handleConfirmPrinted()}
            >
              ยืนยันพิมพ์แล้ว
            </button>

            <button
              className="px-3 py-2 rounded bg-slate-600 text-white"
              type="button"
              onClick={() => navigate("/pos/purchases/barcodes")}
            >
              กลับหน้ารายการ
            </button>
          </div>
        </div>

        {!loaded ? (
          <div className="print-hidden text-gray-500">
            {typeof fetchPrintBatchAction !== "function" && typeof fetchBarcodesByReceiptIdAction !== "function"
              ? "กำลังเตรียมระบบโหลดบาร์โค้ด..."
              : "กำลังเตรียมข้อมูล..."}
          </div>
        ) :  rows.length === 0 ? (
        <div className="print-hidden text-rose-600">ไม่พบข้อมูลบาร์โค้ดสำหรับรายการที่เลือก</div>
        ) : (
        <div className="grid gap-y-[1mm] gap-x-[2mm] mt-1 print-area" style={gridStyle}>
          {visibleItems.map((item) => {
            const receiptId = item.receiptId;
            const rowKey = `${receiptId}-${item.id || item.barcode}-${item._dupIdx ?? 0}`;

            const validC39 = isValidCode39(item?.barcode);
            const cellOpacity = validC39 ? 1 : 0.65;

            const measuredW = Number(barcodeWidthMap[rowKey] || 0);
            const approxW = getApproxBarcodeWidthPx(item.barcode);
            const finalW = Math.max(48, measuredW > 0 ? measuredW : approxW);

            const displayName = getListDisplayNameByWidth(item, finalW);
            const code = (item?.barcode || "").toString().trim().toUpperCase();

            return (
              <div
                key={rowKey}
                className={`barcode-cell border p-0.5 rounded text-left flex flex-col items-start justify-start relative ${validC39 ? "" : "border-rose-300 bg-rose-50"
                  }`}
                style={{ opacity: cellOpacity }}
              >
                <div className="absolute left-1 top-1 text-[11px] text-gray-500">#{receiptId}</div>

                {item.printed ? (
                  <div className="absolute right-1 top-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    PRINTED
                  </div>
                ) : null}

                {!validC39 ? (
                  <div className="absolute right-1 bottom-1 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    INVALID
                  </div>
                ) : null}

                <div className="barcode-block" style={{ width: "100%", maxWidth: "100%" }}>
                  <div className="barcode-product-name" title={item.productName || ""}>
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
                            transform: isPrinting ? "none" : `scaleX(${fontScaleX})`,
                            transformOrigin: "center top",
                            display: "inline-block",
                            marginTop: "0px",
                          }}
                        >
                          *{code}*
                        </div>
                      </div>
                    ) : null}

                    {showQr ? (
                      <div
                        style={{
                          marginTop: showBarcode ? "4px" : "0px",
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <QrSvg value={code} size={clampQrSize(qrSizePx)} />
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

export default PrintBarcodeBatchPage;






