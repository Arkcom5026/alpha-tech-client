

// =========================================
// File: utils/idb.js
// Desc: IndexedDB helpers for draftScans persistence (ESM)
// Notes:
// - Frontend only. Safe no-op fallbacks when IndexedDB is unavailable.
// - Store: DB "pos-local" → objectStore "draftScans" (keyPath: 'receiptId')
// - Each record: { receiptId, drafts: Array<{ barcode: string, sn?: string|null }> }
// =========================================

const DB_NAME = 'pos-local';
const DB_VERSION = 1; // bump if schema changes
const STORE_NAME = 'draftScans';

function hasIDB() {
  try { return typeof indexedDB !== 'undefined'; } catch { return false; }
}

function openDB() {
  if (!hasIDB()) {
    return Promise.reject(new Error('IndexedDB not available'));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'receiptId' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open DB'));
  });
}

function txStore(db, mode) {
  const tx = db.transaction(STORE_NAME, mode);
  return { tx, store: tx.objectStore(STORE_NAME) };
}

/** Save (upsert) a draft list for a receiptId */
export async function saveDraftScans(receiptId, drafts) {
  if (!receiptId) throw new Error('saveDraftScans: missing receiptId');
  if (!Array.isArray(drafts)) throw new Error('saveDraftScans: drafts must be an array');
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { tx, store } = txStore(db, 'readwrite');
    const req = store.put({ receiptId, drafts });
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error('saveDraftScans failed'));
    tx.onabort = () => reject(tx.error || new Error('saveDraftScans aborted'));
  });
}

/** Load drafts array for a receiptId (empty array if not found) */
export async function loadDraftScans(receiptId) {
  if (!receiptId) throw new Error('loadDraftScans: missing receiptId');
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { tx, store } = txStore(db, 'readonly');
    const req = store.get(receiptId);
    req.onsuccess = () => {
      const row = req.result;
      resolve(row && Array.isArray(row.drafts) ? row.drafts : []);
    };
    req.onerror = () => reject(req.error || new Error('loadDraftScans failed'));
    tx.onabort = () => reject(tx.error || new Error('loadDraftScans aborted'));
  });
}

/** Delete drafts for a receiptId */
export async function clearDraftScans(receiptId) {
  if (!receiptId) throw new Error('clearDraftScans: missing receiptId');
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { tx, store } = txStore(db, 'readwrite');
    const req = store.delete(receiptId);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error('clearDraftScans failed'));
    tx.onabort = () => reject(tx.error || new Error('clearDraftScans aborted'));
  });
}

/** (Optional) List all receiptIds that currently have drafts */
export async function listReceiptDraftKeys() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const { store } = txStore(db, 'readonly');
    const keys = [];
    const req = store.openKeyCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) { keys.push(cursor.primaryKey); cursor.continue(); } else { resolve(keys); }
    };
    req.onerror = () => reject(req.error || new Error('listReceiptDraftKeys failed'));
  });
}

