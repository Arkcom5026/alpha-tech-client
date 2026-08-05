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

const page = read('src/features/stockItem/pages/ListReceiptItemsToScanPage.jsx');
const header = read('src/features/stockItem/components/intake/StockIntakeWorkspaceHeader.jsx');
const summary = read('src/features/stockItem/components/intake/StockIntakeSummary.jsx');
const toolbar = read('src/features/stockItem/components/intake/StockIntakeToolbar.jsx');
const results = read('src/features/stockItem/components/intake/StockIntakeResults.jsx');

assertIncludes(page, 'StockIntakeWorkspaceHeader', 'Stock intake page must compose the workspace header');
assertIncludes(page, 'StockIntakeSummary', 'Stock intake page must compose queue summary');
assertIncludes(page, 'StockIntakeToolbar', 'Stock intake page must compose queue filters');
assertIncludes(page, 'StockIntakeResults', 'Stock intake page must compose responsive results');
assertBefore(page, '<StockIntakeWorkspaceHeader', '<StockIntakeSummary', 'Workspace header must appear before summary');
assertBefore(page, '<StockIntakeSummary', '<StockIntakeToolbar', 'Summary must appear before filters');
assertBefore(page, '<StockIntakeToolbar', '<StockIntakeResults', 'Filters must appear before results');

assertIncludes(page, 'loadReceiptsReadyToScanAction', 'Canonical queue loading authority must remain available');
assertIncludes(page, "filter === 'SN'", 'SN filter authority must remain available');
assertIncludes(page, "filter === 'LOT'", 'LOT filter authority must remain available');
assertIncludes(page, "shopSlug || 'advancetech'", 'Stock intake route must remain tenant aware');
assertIncludes(page, '/pos/purchases/receipt/items/scan/', 'Stock intake scan route must remain available');
assertIncludes(page, 'purchaseOrderCode', 'Purchase order code must remain in scan navigation context');
assertIncludes(page, 'visibilitychange', 'Queue must refresh when the operator returns to the tab');

assertIncludes(header, 'คิวรับสินค้าเข้าสู่สต๊อก', 'Workspace header must state its operational purpose');
assertIncludes(header, 'min-h-11', 'Header refresh action must remain touch sized');
assertIncludes(summary, 'ใบรับทั้งหมด', 'Queue summary must expose receipt count');
assertIncludes(summary, 'SN ค้างยิง', 'Queue summary must expose pending SN');
assertIncludes(summary, 'LOT ค้างเปิด', 'Queue summary must expose pending LOT');
assertIncludes(toolbar, "value: 'ALL'", 'All filter must remain available');
assertIncludes(toolbar, "value: 'SN'", 'SN-only filter must remain available');
assertIncludes(toolbar, "value: 'LOT'", 'LOT-only filter must remain available');
assertIncludes(toolbar, 'aria-pressed', 'Queue filter state must remain accessible');
assertIncludes(toolbar, 'min-h-11', 'Queue filters must remain touch sized');

assertIncludes(results, 'md:hidden', 'Stock intake results must expose mobile cards');
assertIncludes(results, 'md:block', 'Stock intake results must preserve desktop table layout');
assertIncludes(results, '<table', 'Desktop results must preserve table semantics');
assertIncludes(results, 'PendingBadge', 'SN and LOT counts must use badge presentation');
assertIncludes(results, 'bg-teal-700', 'Stock intake action must use system teal');
assertIncludes(results, 'ยิงรับสต๊อก', 'Primary stock intake action must remain explicit');
assertIncludes(results, 'role="status"', 'Loading feedback must remain accessible');
assertIncludes(results, 'role="alert"', 'Error feedback must remain accessible');
assertIncludes(results, 'ไม่มีคิวรับสินค้าเข้าสู่สต๊อก', 'Empty state must remain explicit');

console.log('Purchase stock intake workspace standard contract: PASS');
