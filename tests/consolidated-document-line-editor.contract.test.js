import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const api = read('src/features/combinedBilling/api/combinedBillingApi.js');
const adapter = read('src/features/combinedBilling/adapters/consolidatedDocumentAdapter.js');
const controller = read('src/features/combinedBilling/controllers/consolidatedDocumentLineUpdateController.js');
const source = read('src/features/bill/hooks/useBillDocumentSource.js');
const editor = read('src/features/bill/hooks/useBillDocumentLineEditor.js');
const document = read('src/features/bill/components/FullTaxA4Document.jsx');
const page = read('src/features/bill/pages/PrintBillPageFullTax.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  api.includes('/combined-billing/consolidated-deliveries/${documentId}/document-lines/${lineId}')
    && api.includes('{ documentPrefix, documentDescription, documentSuffix }'),
  'Consolidated document lines must persist before/description/after presentation through the dedicated line endpoint.'
);
assert(
  controller.includes('documentPrefix: normalizeDocumentText(draft?.documentPrefix)')
    && controller.includes('documentDescription: normalizeDocumentText(draft?.documentDescriptionRaw)')
    && controller.includes('documentSuffix: normalizeDocumentText(draft?.documentSuffix)'),
  'Consolidated mutation must preserve the same before/description/after draft contract as SALE.'
);
assert(
  !controller.includes('documentUnitPrice')
    && !controller.includes('priceAdjustment')
    && !controller.includes('lineAmount'),
  'Consolidated editing must not expose financial mutation fields.'
);
assert(
  adapter.includes('documentSourceLineId: Number(line.id)')
    && adapter.includes("documentPrefix: line.documentPrefix || ''")
    && adapter.includes('documentDescriptionRaw: rawDescription')
    && adapter.includes("documentSuffix: line.documentSuffix || ''")
    && !adapter.includes("documentLineEditorMode: 'description'"),
  'Projected consolidated rows must use the same sale-style before/description/after editor shape.'
);
assert(
  source.includes('canEditDocumentLines: Number.isInteger(documentSourceId) && documentSourceId > 0'),
  'Consolidated sources with a real persisted identity must expose document-line editing.'
);
assert(
  editor.includes('saveDocumentLine({ item, draft })'),
  'Bill line editor state must delegate persistence to a source-aware mutation strategy.'
);
assert(
  document.includes('placeholder="ข้อความก่อนสินค้า"')
    && document.includes('placeholder="ข้อความท้ายสินค้า"')
    && document.includes("onToggleDocumentLineEdit?.(item)")
    && document.includes("onSaveDocumentLine?.(item)"),
  'Deterministic full-tax A4 pages must retain the same before/after inline document editor as SALE.'
);
assert(
  page.includes('executeSaleDocumentLineUpdate')
    && page.includes('executeConsolidatedDocumentLineUpdate')
    && page.includes('if (isConsolidated)'),
  'Full-tax page must route SALE and CONSOLIDATED_DELIVERY updates to separate authorities.'
);
assert(
  page.includes('lineId: item?.documentSourceLineId')
    && page.includes('editableDocumentLines={canEditDocumentLines}')
    && page.includes('<FullTaxA4Document')
    && !page.includes('BillLayoutFullTax'),
  'Consolidated saves must target persisted line ids while the page uses the deterministic A4 renderer.'
);
assert(
  document.includes('const MAX_ROWS_LAST_PAGE = 18;')
    && document.includes('const MAX_ROWS_NORMAL_PAGE = 24;')
    && document.includes('const PRINT_PAGE_MARGIN_MM = 4;')
    && document.includes('const PRINT_SHEET_WIDTH_MM = 201;')
    && document.includes('const PRINT_SHEET_HEIGHT_MM = 288;')
    && document.includes('@page { size: A4; margin: ${PRINT_PAGE_MARGIN_MM}mm; }')
    && document.includes('width: ${PRINT_SHEET_WIDTH_MM}mm !important;')
    && document.includes('height: ${PRINT_SHEET_HEIGHT_MM}mm !important;')
    && document.includes('full-tax-editor-column')
    && document.includes('display: none !important;')
    && document.includes("absolute bottom-[5mm]")
    && document.includes("absolute bottom-[31mm]"),
  'Full-tax editor integration must preserve the fuller deterministic grid, print-safe A4 content geometry, print-only editor-column removal, and reserved summary/signature zones.'
);

console.log('Consolidated Document Line Editor Contract: PASS');
