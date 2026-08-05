import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

const page = read('src/features/receiving/quick-stock/pages/QuickStockPage.jsx');
const sessionPanel = read('src/features/receiving/quick-stock/components/QuickReceiptSessionPanel.jsx');
const sessionController = read('src/features/receiving/quick-stock/session/useQuickReceiptSessionController.js');
const header = read('src/features/receiving/quick-stock/components/QuickReceiptWorkspaceHeader.jsx');
const progress = read('src/features/receiving/quick-stock/components/QuickReceiptProgressSummary.jsx');

assertIncludes(page, 'QuickReceiptWorkspaceHeader', 'Workspace header must be composed');
assertIncludes(page, 'QuickReceiptProgressSummary', 'Guided progress summary must be composed');
assertIncludes(page, 'ข้อมูลใบส่งของและรายการรับ', 'Step 1 must own delivery-note session data');
assertIncludes(page, 'ค้นหาและเลือกสินค้า', 'Step 2 must own product selection');
assertIncludes(page, 'รับสินค้า สแกน และกำหนดราคา', 'Step 3 must own intake and pricing');
assertIncludes(page, 'ตรวจทานและยืนยันรายการ', 'Step 4 must own review and commit');
assertIncludes(page, 'sticky bottom-3', 'Mobile commit authority must remain visible');

assertIncludes(page, 'ProductFinderPanel', 'Product search authority must remain mounted');
assertIncludes(page, 'ProductMasterPanel', 'Operational product authority must remain mounted');
assertIncludes(page, 'IntakeControlPanel', 'Barcode and price intake authority must remain mounted');
assertIncludes(page, 'IntakeQueueTable', 'Barcode and serial queue must remain mounted');
assertIncludes(page, 'CommitBar', 'Current-line commit authority must remain mounted');
assertIncludes(page, 'QuickReceiptSessionPanel', 'Quick receipt session authority must remain mounted');

assertIncludes(sessionPanel, 'QuickReceiptDraftPicker', 'Draft resume picker must remain available');
assertIncludes(sessionPanel, 'QuickReceiptHeaderFields', 'Supplier, delivery note, and tax fields must remain available');
assertIncludes(sessionPanel, 'QuickReceiptLineSummary', 'Receipt line review must remain available');
assertIncludes(sessionPanel, 'QuickReceiptActions', 'Save, finalize, and cancel actions must remain available');

assertIncludes(sessionController, "alpha-tech.quick-receipt.local-draft.v2", 'Local draft recovery key must remain stable');
assertIncludes(sessionController, 'listQuickReceiptDrafts', 'Server draft listing authority must remain');
assertIncludes(sessionController, 'resumeDraft', 'Draft resume authority must remain');
assertIncludes(sessionController, 'handleSaveForLater', 'Save-for-later authority must remain');
assertIncludes(sessionController, 'handleFinalize', 'Finalize authority must remain');
assertIncludes(sessionController, 'handleCancelDraft', 'Draft cancellation authority must remain');
assertIncludes(sessionController, 'taxDocumentMode', 'Tax document mode must remain in the header contract');
assertIncludes(sessionController, 'priceRetail', 'Retail price lifecycle must remain');
assertIncludes(sessionController, 'priceWholesale', 'Wholesale price lifecycle must remain');
assertIncludes(sessionController, 'priceTechnician', 'Technician price lifecycle must remain');
assertIncludes(sessionController, 'priceOnline', 'Online price lifecycle must remain');
assertIncludes(sessionController, 'serialNumber', 'Serial number intake authority must remain');

assertIncludes(header, 'รับสินค้าด่วนตามใบส่งของ', 'Workspace header must describe the canonical workflow');
assertIncludes(progress, 'ข้อมูลใบส่งของ', 'Progress summary must begin with delivery-note data');
assertIncludes(progress, 'ตรวจทานและยืนยัน', 'Progress summary must end with review and confirmation');

console.log('Purchase quick receipt workspace standard contract: PASS');
