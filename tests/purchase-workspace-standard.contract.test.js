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

const page = read('src/features/purchaseOrder/list/pages/PurchaseOrderListPage.jsx');
const header = read('src/features/purchaseOrder/list/components/PurchaseOrderWorkspaceHeader.jsx');
const toolbar = read('src/features/purchaseOrder/list/components/PurchaseOrderListToolbar.jsx');
const table = read('src/features/purchaseOrder/list/components/PurchaseOrderListTable.jsx');
const feedback = read('src/features/purchaseOrder/list/components/PurchaseOrderListFeedback.jsx');

assertIncludes(page, 'PurchaseOrderWorkspaceHeader', 'Purchase order list must use the workspace header');
assertIncludes(page, 'PurchaseOrderListToolbar', 'Purchase order list must use the focused toolbar');
assertIncludes(page, 'PurchaseOrderListFeedback', 'Purchase order list must preserve loading and error feedback');
assertIncludes(page, 'PurchaseOrderListTable', 'Purchase order list must preserve the list result authority');
assertBefore(page, '<PurchaseOrderWorkspaceHeader', '<PurchaseOrderListToolbar', 'Workspace header must appear before search tools');
assertIncludes(page, "orderPath('view', id)", 'View navigation authority must remain available');
assertIncludes(page, "orderPath('edit', id)", 'Edit navigation authority must remain available');
assertIncludes(page, "orderPath('print', id)", 'Print navigation authority must remain available');

assertIncludes(header, 'สร้างใบสั่งซื้อ', 'Create purchase order action must remain explicit');
assertIncludes(header, 'min-h-11', 'Primary create action must remain touch sized');
assertIncludes(header, 'bg-teal-700', 'Primary create action must use the system teal authority');
assertIncludes(toolbar, 'type="search"', 'Purchase search must expose search semantics');
assertIncludes(toolbar, 'w-full', 'Purchase search must use available mobile width');
assertIncludes(toolbar, 'แสดงประวัติทั้งหมด', 'History filter must remain available');
assertIncludes(table, 'md:hidden', 'Purchase results must expose mobile cards');
assertIncludes(table, 'md:block', 'Purchase results must preserve desktop table layout');
assertIncludes(table, '<table', 'Purchase results must preserve table semantics on desktop');
assertIncludes(table, 'min-h-11', 'Purchase row actions must remain touch sized');
assertIncludes(table, 'PurchaseOrderStatusBadge', 'Status projection must remain visible in both layouts');
assertIncludes(table, 'ไม่พบข้อมูลใบสั่งซื้อ', 'Empty state must remain explicit');
assertIncludes(feedback, 'role="status"', 'Loading feedback must be accessible');
assertIncludes(feedback, 'role="alert"', 'Error feedback must be accessible');

console.log('Purchase workspace standard contract: PASS');
