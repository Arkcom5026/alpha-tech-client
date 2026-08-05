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

const page = read('src/features/stockAudit/pages/ReadyToSellAuditPage.jsx');
const scanner = read('src/features/stockAudit/components/ScanInput.jsx');
const table = read('src/features/stockAudit/components/AuditTable.jsx');
const summary = read('src/features/stockAudit/components/workspace/StockAuditSessionSummary.jsx');
const actions = read('src/features/stockAudit/components/workspace/StockAuditActionBar.jsx');
const panel = read('src/features/stockAudit/components/workspace/StockAuditListPanel.jsx');

assertIncludes(page, 'StockAuditSessionSummary', 'Stock audit page must use the session summary workspace');
assertIncludes(page, 'StockAuditActionBar', 'Stock audit page must use the operational action bar');
assertIncludes(page, 'StockAuditListPanel', 'Stock audit page must use shared list panels');
assertIncludes(page, "event.key === 'F2'", 'F2 focus authority must remain available');
assertIncludes(page, "event.key === 'F3'", 'F3 scan-mode authority must remain available');
assertIncludes(page, "scanMode === 'BARCODE'", 'Barcode scan mode must remain available');
assertIncludes(page, "scanMode === 'SN'", 'SN scan mode must remain available');
assertIncludes(page, "confirmAuditAction('MARK_LOST')", 'Lost-stock close authority must remain available');
assertIncludes(page, "confirmAuditAction('MARK_PENDING')", 'Pending close authority must remain available');
assertIncludes(page, 'loadActiveReadyAuditAction', 'Active audit recovery must remain available');

assertIncludes(summary, 'เช็กสต๊อกหน้าร้าน', 'Session summary must identify the operator workspace');
assertIncludes(summary, 'grid-cols-2', 'Session metrics must support compact mobile layout');
assertIncludes(actions, 'min-h-11', 'Audit actions must expose touch-sized controls');
assertIncludes(actions, 'บันทึกสินค้าสูญหาย', 'Lost-stock action must remain explicit');
assertIncludes(actions, 'ปิดรอบแบบค้างตรวจ', 'Pending close action must remain explicit');
assertIncludes(panel, 'flex-col', 'List panel header must support narrow screens');

assertIncludes(scanner, 'w-full', 'Scanner input must use available mobile width');
assertIncludes(scanner, 'valueRef', 'Scanner auto-submit must read the latest value');
assertIncludes(scanner, 'autoComplete="off"', 'Scanner input must disable browser autocomplete');
assertIncludes(table, 'md:hidden', 'Audit results must expose mobile cards');
assertIncludes(table, 'hidden md:block', 'Audit results must preserve desktop table layout');
assertIncludes(table, 'break-all', 'Barcode and serial values must not overflow narrow screens');
assertIncludes(table, 'min-h-11', 'Pagination controls must remain touch sized');

console.log('Stock audit mobile workspace contract: PASS');
