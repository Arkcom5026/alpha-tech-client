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
const layout = read('src/features/bill/components/BillLayoutFullTax.jsx');
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
  layout.includes('placeholder="ข้อความก่อนสินค้า"')
    && layout.includes('placeholder="ข้อความท้ายสินค้า"')
    && layout.includes('renderDocumentLineButton(item)')
    && layout.includes('editableDocumentLines ? ('),
  'Consolidated documents must reuse the same inline tail-column before/after editor as SALE.'
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
    && !page.includes('ConsolidatedDocumentLineEditorPanel'),
  'Consolidated saves must target persisted line ids while sharing the SALE inline edit column.'
);
assert(
  page.includes('display: block !important;')
    && page.includes('width: 210mm !important;')
    && page.includes('min-height: 296mm !important;')
    && page.includes('height: auto !important;')
    && page.includes('box-sizing: border-box !important;')
    && page.includes('useCompactA4Grid')
    && page.includes('saleItems.length <= 18')
    && page.includes('.bill-print-compact-a4 .print-a4 tbody tr:nth-last-child(-n+2)')
    && page.includes("'bill-print-compact-a4'")
    && page.includes('thead th:nth-child(7)')
    && page.includes('visibility: hidden !important;')
    && !page.includes('width: 190mm !important;')
    && !page.includes('printFillerRowsToHide'),
  'Short full-tax previews must physically fit A4 before printing by sharing one geometry in screen and print.'
);

const layoutCloseIndex = page.indexOf('</StoreDocumentHeaderScope>');
const finalAuthorityIndex = page.indexOf('data-bill-print-final-authority');
assert(
  layoutCloseIndex >= 0
    && finalAuthorityIndex > layoutCloseIndex
    && page.slice(finalAuthorityIndex).includes('margin: 0 !important;')
    && page.slice(finalAuthorityIndex).includes('min-height: 296mm !important;'),
  'The final @page/A4 authority must render after BillLayoutFullTax so its embedded 10mm @page rule cannot win the cascade.'
);

console.log('Consolidated Document Line Editor Contract: PASS');
