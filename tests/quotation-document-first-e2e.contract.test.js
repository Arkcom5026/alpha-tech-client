import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const includes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};
const excludes = (source, value, message) => {
  if (source.includes(value)) throw new Error(message || `Expected source to exclude: ${value}`);
};

const api = read('src/features/quotation/api/quotationApi.js');
const createPage = read('src/features/quotation/pages/CreateQuotationPage.jsx');
const editor = read('src/features/quotation/pages/QuotationEditorPage.jsx');
const printPage = read('src/features/quotation/pages/QuotationPrintPage.jsx');
const routes = read('src/routes/partner/salesRoutes.jsx');
const sidebar = read('src/config/sidebarSalesItems.js');

includes(api, "apiClient.post('/sales/quotations', { customerId })", 'Quotation draft creation endpoint is required');
includes(api, 'addQuotationLine', 'Quotation API must expose direct line creation authority');
includes(api, 'updateQuotationLine', 'Quotation API must expose line mutation authority for document workspace editing');
includes(createPage, 'data-testid="quotation-create-empty-draft"', 'Zero-item draft creation must stay an explicit tested action');
includes(createPage, "customerId: selectedCustomer?.id || null", 'Customer lookup must remain optional');
includes(createPage, 'เริ่มจากเอกสารเปล่าได้', 'Create surface must explain document-first workflow');
excludes(createPage, 'items.length', 'Create action must never depend on quotation item count');
excludes(createPage, 'productId', 'Create surface must not require or own product selection');

includes(editor, 'หน้าเอกสารนี้เป็นพื้นที่ทำงานหลัก', 'Document editor must remain the primary quotation workspace');
includes(editor, 'พิมพ์เองได้ทั้งหมด หรือค้นหาสินค้าเพื่อช่วยเติมชื่อ/ราคา', 'Product catalog must remain helper-only');
includes(editor, 'sourceProductId: null', 'Manual line state must support no product reference');
includes(editor, 'รายละเอียดหลายบรรทัด', 'Document lines must support detailed multiline authoring');
includes(editor, 'ยังไม่มีรายการ', 'Editor must render valid zero-line quotation state');
includes(editor, 'searchSaleItems', 'Existing product catalog may assist document authoring');

includes(printPage, "documentType: 'QUOTATION'", 'Quotation print must use store document-header authority');
includes(printPage, 'whitespace-pre-wrap', 'A4 document must preserve multiline descriptions');
includes(printPage, 'tableFillerHeightMm', 'Quotation table must reserve formal document body space instead of collapsing around short content');
includes(printPage, '108 - occupied', 'Quotation table must preserve the current delivery-note-aligned settlement baseline');
includes(printPage, 'quotation-table-filler', 'Reserved table body must retain the document column grid');
includes(printPage, 'quotation-document-header', 'Quotation must expose a dedicated document header boundary');
includes(printPage, 'quotation-document-title', 'Quotation title must be a centered document anchor like the delivery note standard');
includes(printPage, 'ต้นฉบับลูกค้า', 'Issued quotation must expose a customer-original document marker');
includes(printPage, 'quotation-info-panel', 'Customer and document metadata must use consistent information panels');
includes(printPage, '<span className="font-semibold">เลขที่:</span>', 'Quotation number must live inside document metadata rather than compete with the document title');
includes(printPage, 'quotation-settlement grid h-[34mm]', 'Terms and totals must form one stable footer row attached to the item table');
includes(printPage, 'quotation-signatures grid', 'Quotation signatures must follow the settlement section without an automatic page-bottom spacer');
excludes(printPage, 'quotation-signatures mt-auto', 'Quotation signatures must not be forced to the physical page bottom independently of settlement');
includes(printPage, 'editingLineId', 'Quotation A4 workspace must track the document line being edited');
includes(printPage, 'beginLineEdit', 'Quotation A4 workspace must expose direct per-line editing');
includes(printPage, 'beginNewLine', 'Quotation A4 workspace must expose direct line creation');
includes(printPage, "editingLineId === 'NEW'", 'New-line authoring must have an explicit document workspace state');
includes(printPage, 'addQuotationLine(quotationId, lineDraft)', 'New document lines must persist through canonical quotation line authority');
includes(printPage, '> เพิ่มรายการ</button>', 'Draft A4 workspace must expose an add-line action directly below the table');
includes(printPage, 'quotation-line-editor print:hidden', 'Inline line editor must remain screen-only and never print');
includes(printPage, 'updateQuotationLine(quotationId, editingLineId, lineDraft)', 'Inline document editing must persist through canonical quotation line authority');
includes(printPage, 'พิมพ์เองได้ทั้งหมด ไม่จำเป็นต้องอ้างอิงสินค้า', 'Direct line creation must preserve manual-first quotation semantics');
includes(printPage, 'รายละเอียดเพิ่มเติม', 'Inline editor must support multiline document details');
includes(printPage, 'ราคา/หน่วย', 'Inline editor must support commercial price editing');
includes(printPage, 'ส่วนลด', 'Inline editor must support line discount editing');
includes(printPage, 'print:w-[45%]', 'Printable table must reclaim the screen-only action column width');
includes(printPage, 'aria-label="แก้ไขรายการนี้บนใบเสนอราคา"', 'Each draft quotation row must expose an accessible edit action');
includes(printPage, 'ผู้เสนอราคา / QUOTED BY', 'Quotation signature language must be explicit and bilingual');
includes(printPage, 'ผู้ตอบรับใบเสนอราคา / ACCEPTED BY', 'Customer acceptance signature must remain explicit');
includes(printPage, 'width: 195mm !important', 'Quotation print must follow the established 195mm printable A4 frame');
includes(printPage, 'height: 280mm !important', 'Quotation print must follow the established 280mm printable A4 height');
includes(printPage, 'overflow: hidden !important', 'Single-page quotation shell must prevent phantom overflow pages');
excludes(printPage, 'ไม่มีรายการสินค้า —', 'Formal quotation print must not expose application-style empty-state copy');

includes(routes, "{ path: 'quotations', element: <QuotationListPage /> }", 'Quotation list route is required');
includes(routes, "{ path: 'quotations/new', element: <CreateQuotationPage /> }", 'Quotation create route is required');
includes(routes, "{ path: 'quotations/:quotationId', element: <QuotationEditorPage /> }", 'Quotation editor route is required');
includes(routes, "{ path: 'quotations/:quotationId/print', element: <QuotationPrintPage /> }", 'Quotation A4 print route is required');
includes(sidebar, "label: 'ใบเสนอราคา'", 'Sales navigation must expose quotation workspace');

console.log('Quotation Document-First E2E Client contract: PASS');
