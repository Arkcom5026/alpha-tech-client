import {
  QUICK_RECEIPT_LOCAL_DRAFT_STORAGE_KEY,
  createEmptyQuickReceiptHeader,
  normalizeQuickReceiptTaxDocumentMode,
} from '../models/quickReceiptSessionModels';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export const loadQuickReceiptLocalDraft = () => {
  const storage = getStorage();
  if (!storage) {
    return { header: createEmptyQuickReceiptHeader(), lines: [] };
  }

  const saved = storage.getItem(QUICK_RECEIPT_LOCAL_DRAFT_STORAGE_KEY);
  if (!saved) {
    return { header: createEmptyQuickReceiptHeader(), lines: [] };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      header: {
        ...createEmptyQuickReceiptHeader(),
        ...(parsed.header || {}),
        taxDocumentMode: normalizeQuickReceiptTaxDocumentMode(
          parsed.header?.taxDocumentMode
        ),
      },
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
    };
  } catch (_error) {
    return { header: createEmptyQuickReceiptHeader(), lines: [] };
  }
};

export const saveQuickReceiptLocalDraft = ({ header, lines }) => {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(
    QUICK_RECEIPT_LOCAL_DRAFT_STORAGE_KEY,
    JSON.stringify({ header, lines })
  );
};

export const clearQuickReceiptLocalDraft = () => {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(QUICK_RECEIPT_LOCAL_DRAFT_STORAGE_KEY);
};
