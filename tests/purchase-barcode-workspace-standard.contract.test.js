import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

const listHeader = read('src/features/barcode/components/BarcodeWorkspaceHeader.jsx');
const previewHeader = read('src/features/barcode/components/BarcodePreviewWorkspaceHeader.jsx');
const table = read('src/features/barcode/controllers/BarcodePrintTable.jsx');
const listPage = read('src/features/barcode/pages/BarcodeReceiptListPage.jsx');
const previewPage = read('src/features/barcode/pages/PreviewBarcodePage.jsx');

assertIncludes(listHeader, 'รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด', 'Barcode list header must state its operational purpose');
assertIncludes(listHeader, 'min-h-11', 'Barcode list actions must remain touch sized');
assertIncludes(listHeader, 'bg-teal-700', 'Barcode range action must use system teal');
assertIncludes(previewHeader, 'พรีวิวบาร์โค้ด', 'Barcode preview header must remain explicit');
assertIncludes(previewHeader, 'จำนวนฉลาก', 'Preview header must summarize label count');
assertIncludes(previewHeader, 'พิมพ์แล้ว', 'Preview header must summarize printed progress');

assertIncludes(table, 'md:hidden', 'Barcode receipt results must expose mobile cards');
assertIncludes(table, 'md:block', 'Barcode receipt results must preserve desktop table layout');
assertIncludes(table, '<table', 'Barcode receipt results must preserve table semantics on desktop');
assertIncludes(table, 'toggleSelectAll', 'Batch selection authority must remain available');
assertIncludes(table, 'generateBarcodesAction', 'Initial barcode generation authority must remain available');
assertIncludes(table, 'reprintBarcodesAction', 'Barcode reprint authority must remain available');
assertIncludes(table, '/pos/purchases/barcodes/preview/', 'Single receipt preview route must remain available');
assertIncludes(table, '/pos/purchases/barcodes/print?ids=', 'Batch print route must remain available');
assertIncludes(table, "shopSlug || 'advancetech'", 'Barcode routes must remain tenant aware');
assertIncludes(table, 'min-h-11', 'Barcode print actions must remain touch sized');
assertIncludes(table, 'bg-teal-700', 'Initial print action must use system teal');
assertIncludes(table, 'role="alert"', 'Barcode result errors must be accessible');
assertIncludes(table, 'ไม่มีรายการค้างพิมพ์บาร์โค้ด', 'Unprinted empty state must remain explicit');

assertIncludes(listPage, 'loadReceiptSummariesAction', 'Receipt summary loading authority must remain on the list page');
assertIncludes(listPage, "mode === 'UNPRINTED'", 'Unprinted mode must remain available');
assertIncludes(listPage, "mode === 'REPRINT'", 'Reprint mode must remain available');
assertIncludes(listPage, 'localStorage.setItem', 'Barcode list filter persistence must remain available');
assertIncludes(previewPage, 'markBarcodeAsPrintedAction', 'Barcode printed confirmation authority must remain available');
assertIncludes(previewPage, 'markReceiptAsPrintedAction', 'Receipt printed confirmation authority must remain available');
assertIncludes(previewPage, 'QrSvg', 'QR rendering authority must remain available');

console.log('Purchase barcode workspace standard contract: PASS');
