export const READY_TO_SELL_SORT_MODE = Object.freeze({
  NEWEST: 'NEWEST',
  FIFO: 'FIFO',
});

export const normalizeReadyToSellScan = (value) => String(value ?? '').trim();

const normalizeComparable = (value) => normalizeReadyToSellScan(value).toLowerCase();
const digitsOnly = (value) => normalizeComparable(value).replace(/[^0-9]+/g, '');

export const matchesReadyToSellScan = (item, rawScan) => {
  const key = normalizeComparable(rawScan);
  if (!key) return false;

  const barcode = normalizeComparable(item?.barcode);
  const serialNumber = normalizeComparable(item?.serialNumber);

  if ((barcode && barcode === key) || (serialNumber && serialNumber === key)) return true;

  const digits = digitsOnly(key);
  if (!digits) return false;

  return (
    (barcode && digitsOnly(barcode) === digits) ||
    (serialNumber && digitsOnly(serialNumber) === digits)
  );
};

export const findReadyToSellScanMatch = (items = [], rawScan) => {
  const rows = Array.isArray(items) ? items : [];
  return rows.find((item) => matchesReadyToSellScan(item, rawScan)) || null;
};

const resolveReceivedTimestamp = (item) => {
  const raw = item?.receivedAt ?? item?.createdAt ?? null;
  if (!raw) return 0;
  const timestamp = new Date(raw).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const sortReadyToSellItems = (items = [], mode = READY_TO_SELL_SORT_MODE.NEWEST) => {
  const rows = Array.isArray(items) ? [...items] : [];

  rows.sort((left, right) => {
    const leftTime = resolveReceivedTimestamp(left);
    const rightTime = resolveReceivedTimestamp(right);
    return mode === READY_TO_SELL_SORT_MODE.FIFO
      ? leftTime - rightTime
      : rightTime - leftTime;
  });

  return rows;
};

export const resolveReadyToSellScanOutcome = (items = [], rawScan) => {
  const normalized = normalizeReadyToSellScan(rawScan);
  if (!normalized) {
    return { matchedItem: null, highlightId: null, message: '', shouldScroll: false };
  }

  const matchedItem = findReadyToSellScanMatch(items, normalized);
  if (!matchedItem) {
    return {
      matchedItem: null,
      highlightId: null,
      message: `ไม่พบรายการสำหรับ “${normalized}”`,
      shouldScroll: false,
    };
  }

  return {
    matchedItem,
    highlightId: matchedItem?.id ?? null,
    message: '',
    shouldScroll: matchedItem?.id != null,
  };
};
