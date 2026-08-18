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

includes(printPage, 'ไม่มีรายการสินค้า — เอกสารนี้อาจใช้ข้อความรายละเอียดทั่วไปแทนรายการสินค้า', 'A4 print must remain valid with zero items');
includes(printPage, "documentType: 'QUOTATION'", 'Quotation print must use store document-header authority');
includes(printPage, 'whitespace-pre-wrap', 'A4 document must preserve multiline descriptions');

includes(routes, "{ path: 'quotations', element: <QuotationListPage /> }", 'Quotation list route is required');
includes(routes, "{ path: 'quotations/new', element: <CreateQuotationPage /> }", 'Quotation create route is required');
includes(routes, "{ path: 'quotations/:quotationId', element: <QuotationEditorPage /> }", 'Quotation editor route is required');
includes(routes, "{ path: 'quotations/:quotationId/print', element: <QuotationPrintPage /> }", 'Quotation A4 print route is required');
includes(sidebar, "label: 'ใบเสนอราคา'", 'Sales navigation must expose quotation workspace');

console.log('Quotation Document-First E2E Client contract: PASS');