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
const panel = read('src/features/combinedBilling/components/ConsolidatedDocumentLineEditorPanel.jsx');
const page = read('src/features/bill/pages/PrintBillPageFullTax.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  api.includes('/combined-billing/consolidated-deliveries/${documentId}/document-lines/${lineId}')
    && api.includes('{ description }'),
  'Consolidated document lines must persist description through the dedicated line endpoint.'
);
assert(
  controller.includes('description = normalizeDocumentText(draft?.documentDescriptionRaw)')
    && controller.includes('description,'),
  'Consolidated mutation must derive its payload only from the document description draft.'
);
assert(
  !controller.includes('documentPrefix')
    && !controller.includes('documentSuffix')
    && !controller.includes('documentUnitPrice')
    && !controller.includes('priceAdjustment')
    && !controller.includes('lineAmount'),
  'Consolidated editing must not expose prefix/suffix or financial mutation fields.'
);
assert(
  adapter.includes('documentSourceLineId: Number(line.id)')
    && adapter.includes("documentLineEditorMode: 'description'")
    && adapter.includes("const rawDescription = line.description || ''"),
  'Projected consolidated rows must retain persisted line identity and description-only editor mode.'
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
  panel.includes("'documentDescriptionRaw'")
    && panel.includes('แก้ไขคำอธิบายรายการเอกสาร')
    && panel.includes('ไม่เปลี่ยนจำนวน ราคา VAT หรือยอดรวม')
    && panel.includes('print:hidden'),
  'Consolidated workspace must provide an explicit description-only, non-printing editor panel.'
);
assert(
  page.includes('executeSaleDocumentLineUpdate')
    && page.includes('executeConsolidatedDocumentLineUpdate')
    && page.includes('if (isConsolidated)')
    && page.includes('ConsolidatedDocumentLineEditorPanel'),
  'Full-tax page must route SALE and CONSOLIDATED_DELIVERY updates to separate authorities.'
);
assert(
  page.includes('lineId: item?.documentSourceLineId')
    && page.includes('const useInlineSaleEditor = canEditDocumentLines && !isConsolidated'),
  'Consolidated saves must target persisted consolidated line ids without changing the SALE inline editor.'
);

console.log('Consolidated Document Line Editor Contract: PASS');
