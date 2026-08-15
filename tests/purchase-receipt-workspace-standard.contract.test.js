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
const assertExcludes = (source, value, message) => {
  if (source.includes(value)) throw new Error(message || `Expected source to exclude: ${value}`);
};
const assertBefore = (source, first, second, message) => {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= secondIndex) throw new Error(message);
};

const page = read('src/features/purchaseOrderReceipt/pages/ListPurchaseOrderReceiptPage.jsx');
const table = read('src/features/purchaseOrderReceipt/components/purchaseOrderReceiptTable.jsx');
const header = read('src/features/purchaseOrderReceipt/components/ReceiptWorkspaceHeader.jsx');
const summary = read('src/features/purchaseOrderReceipt/components/ReceiptSummary.jsx');
const statusBadge = read('src/features/purchaseOrderReceipt/components/ReceiptStatusBadge.jsx');
const feedback = read('src/features/purchaseOrderReceipt/components/ReceiptFeedback.jsx');
const purchaseOrderLifecycle = read('src/features/purchaseOrder/lifecycle/index.js');

assertIncludes(page, 'ReceiptWorkspaceHeader', 'Receipt page must use the workspace header');
assertIncludes(page, 'ReceiptSummary', 'Receipt page must expose status summary');
assertIncludes(page, 'ReceiptFeedback', 'Receipt page must preserve error feedback');
assertIncludes(page, 'PurchaseOrderReceiptTable', 'Receipt page must preserve receipt result authority');
assertBefore(page, '<ReceiptWorkspaceHeader', '<ReceiptSummary', 'Header must appear before summary');
assertBefore(page, '<ReceiptSummary', '<PurchaseOrderReceiptTable', 'Summary must appear before receipt results');
assertIncludes(page, 'fetchPurchaseOrdersForReceiptAction', 'Store fetch authority must remain available');
assertIncludes(page, "fetchAction({ shopSlug: shopSlug || 'advancetech' })", 'Store-scoped fetch must remain explicit');

assertIncludes(header, 'รายการใบสั่งซื้อที่รอตรวจรับ', 'Receipt workspace title must remain explicit');
assertIncludes(header, 'role="status"', 'Connection status must be accessible');
assertIncludes(summary, 'PARTIALLY_RECEIVED', 'Partial receipt summary must remain available');
assertIncludes(summary, 'COMPLETED', 'Completed receipt summary must remain available');
assertIncludes(feedback, 'role="alert"', 'Receipt errors must expose alert semantics');

assertIncludes(table, 'type="search"', 'Receipt search must expose search semantics');
assertIncludes(table, 'STATUS_FILTERS', 'Receipt status filters must remain centralized');
assertIncludes(table, 'md:hidden', 'Receipt results must expose mobile cards');
assertIncludes(table, 'md:block', 'Receipt results must preserve desktop table layout');
assertIncludes(table, '<table', 'Receipt results must preserve desktop table semantics');
assertIncludes(table, 'min-h-11', 'Receipt actions must remain touch sized');
assertIncludes(table, "@/features/purchaseOrder/lifecycle", 'Receipt cancellation must consume Purchase Order public lifecycle boundary');
assertIncludes(table, 'cancelPurchaseOrder(id)', 'Receipt UI must coordinate cancellation through Purchase Order');
assertIncludes(table, 'fetchPurchaseOrdersForReceiptAction', 'Receipt UI must refresh eligibility after Purchase Order cancellation');
assertExcludes(table, 'cancelPurchaseOrderAction', 'Receipt UI must not use Receipt-owned Purchase Order cancellation mutation');
assertIncludes(table, '/pos/purchases/receipt/create/', 'Receipt navigation authority must remain available');
assertIncludes(table, 'ConfirmActionDialog', 'Cancel action must preserve explicit confirmation');
assertIncludes(table, 'intent="destructive"', 'Cancel confirmation must communicate destructive intent');
assertExcludes(table, 'window.confirm', 'Cancel action must not use the browser confirmation popup');
assertIncludes(table, 'ReceiptStatusBadge', 'Receipt status projection must remain visible');
assertIncludes(table, 'ไม่พบรายการที่ตรงกับเงื่อนไข', 'Receipt empty state must remain explicit');
assertIncludes(statusBadge, 'aria-label={`สถานะ ${config.label}`}', 'Receipt status badge must remain accessible');

assertIncludes(purchaseOrderLifecycle, 'cancelPurchaseOrder', 'Purchase Order must expose cancellation as lifecycle authority');
assertIncludes(purchaseOrderLifecycle, "status: 'CANCELLED'", 'Purchase Order cancellation must preserve CANCELLED transition');

console.log('Purchase receipt workspace standard contract: PASS');
