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
const assertBefore = (source, first, second, message) => {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= secondIndex) throw new Error(message);
};

const listHeader = read('src/features/barcode/components/BarcodeWorkspaceHeader.jsx');
const toolbar = read('src/features/barcode/components/BarcodeListToolbar.jsx');
const previewHeader = read('src/features/barcode/components/BarcodePreviewWorkspaceHeader.jsx');
const previewSettings = read('src/features/barcode/components/BarcodePreviewSettings.jsx');
const previewActionBar = read('src/features/barcode/components/BarcodePreviewActionBar.jsx');
const table = read('src/features/barcode/controllers/BarcodePrintTable.jsx');
const listPage = read('src/features/barcode/pages/BarcodeReceiptListPage.jsx');
const previewWorkspacePage = read('src/features/barcode/pages/BarcodePreviewWorkspacePage.jsx');
const previewPage = read('src/features/barcode/pages/PreviewBarcodePage.jsx');
const purchaseRoutes = read('src/routes/partner/purchasesRoutes.jsx');

assertIncludes(listHeader, 'รายการใบรับสินค้าที่รอพิมพ์บาร์โค้ด', 'Barcode list header must state its operational purpose');
assertIncludes(listHeader, 'min-h-11', 'Barcode list actions must remain touch sized');
assertIncludes(listHeader, 'bg-teal-700', 'Barcode range action must use system teal');
assertIncludes(toolbar, "onModeChange?.('UNPRINTED')", 'Unprinted mode control must remain explicit');
assertIncludes(toolbar, "onModeChange?.('REPRINT')", 'Reprint mode control must remain explicit');
assertIncludes(toolbar, 'type="search"', 'Barcode filters must expose search semantics');
assertIncludes(toolbar, 'min-h-11', 'Barcode toolbar controls must remain touch sized');
assertIncludes(previewHeader, 'เตรียม Barcode / SN ก่อนรับสินค้า', 'Barcode preparation header must state the pre-receive identity step explicitly');
assertIncludes(previewHeader, 'ไปยิงรับสินค้าเข้าสต๊อก', 'Barcode preparation must expose the stock-receive continuation explicitly');
assertIncludes(previewHeader, 'จำนวนฉลาก', 'Preview header must summarize label count');
assertIncludes(previewHeader, 'พิมพ์แล้ว', 'Preview header must summarize printed progress');
assertIncludes(previewSettings, 'ตั้งค่าการพิมพ์', 'Preview settings foundation must remain available');
assertIncludes(previewActionBar, 'พิมพ์ฉลาก', 'Preview print action foundation must remain available');
assertIncludes(previewActionBar, 'ยืนยันว่าพิมพ์แล้ว', 'Preview confirmation action foundation must remain available');

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

assertIncludes(listPage, 'BarcodeWorkspaceHeader', 'Barcode list must compose the workspace header');
assertIncludes(listPage, 'BarcodeListToolbar', 'Barcode list must compose the focused toolbar');
assertBefore(listPage, '<BarcodeWorkspaceHeader', '<BarcodeListToolbar', 'Workspace header must appear before filters');
assertIncludes(listPage, 'loadReceiptSummariesAction', 'Receipt summary loading authority must remain on the list page');
assertIncludes(listPage, "mode === 'UNPRINTED'", 'Unprinted mode must remain available');
assertIncludes(listPage, "mode === 'REPRINT'", 'Reprint mode must remain available');
assertIncludes(listPage, 'localStorage.setItem', 'Barcode list filter persistence must remain available');
assertIncludes(listPage, 'supplierIdByNormalizedName', 'Supplier ID resolution authority must remain available');
assertIncludes(listPage, 'setTimeout', 'Remote code search debounce must remain available');
assertIncludes(listPage, "navigate(`/${targetSlug}/pos/purchases/barcodes/range-print`)", 'Range print route must remain tenant aware');
assertIncludes(listPage, 'role="alert"', 'List loading errors must remain accessible');

assertIncludes(previewWorkspacePage, 'BarcodePreviewWorkspaceHeader', 'Preview route must compose the workspace header');
assertIncludes(previewWorkspacePage, '<PreviewBarcodePage />', 'Legacy renderer and print authority must remain mounted inside the workspace');
assertBefore(previewWorkspacePage, '<BarcodePreviewWorkspaceHeader', '<PreviewBarcodePage />', 'Preview header must appear before the print workspace');
assertIncludes(previewWorkspacePage, 'useBarcodeStore', 'Preview summary must project canonical barcode state');
assertIncludes(previewWorkspacePage, 'print:hidden', 'Workspace chrome must remain excluded from printed output');
assertIncludes(purchaseRoutes, 'BarcodePreviewWorkspacePage', 'Purchase routes must use the preview workspace composition');
assertIncludes(purchaseRoutes, "path: 'preview/:receiptId'", 'Preview route contract must remain stable');

assertIncludes(previewPage, 'markBarcodeAsPrintedAction', 'Barcode printed confirmation authority must remain available');
assertIncludes(previewPage, 'markReceiptAsPrintedAction', 'Receipt printed confirmation authority must remain available');
assertIncludes(previewPage, 'QrSvg', 'QR rendering authority must remain available');
assertIncludes(previewPage, 'window.print', 'Browser print authority must remain available');
assertIncludes(previewPage, 'SETTINGS_KEY', 'Persisted print settings authority must remain available');

console.log('Purchase barcode workspace standard contract: PASS');
