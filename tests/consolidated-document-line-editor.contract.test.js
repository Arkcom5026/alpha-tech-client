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
const page = read('src/features/bill/pages/PrintBillPageFullTax.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  api.includes('/combined-billing/consolidated-deliveries/${id}/document-lines'),
  'Consolidated document lines must persist through a dedicated API endpoint.'
);
assert(
  /lines:\s*\[\{[\s\S]*?id:\s*normalizedLineId[\s\S]*?documentPrefix[\s\S]*?documentDescription[\s\S]*?documentSuffix/m.test(controller),
  'Consolidated mutation payload must contain only the line identity and presentation fields.'
);
assert(
  !controller.includes('documentUnitPrice') && !controller.includes('priceAdjustment') && !controller.includes('lineAmount'),
  'Client presentation editing must not expose financial mutation fields.'
);
assert(
  adapter.includes('documentSourceLineId: Number(line.id)'),
  'Projected consolidated rows must retain their persisted line identity.'
);
assert(
  adapter.includes("documentPrefix: line.documentPrefix || ''")
    && adapter.includes("documentSuffix: line.documentSuffix || ''")
    && adapter.includes("const rawDescription = line.documentDescription || ''"),
  'Printable projection must round-trip consolidated presentation overrides.'
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
  page.includes('executeSaleDocumentLineUpdate')
    && page.includes('executeConsolidatedDocumentLineUpdate')
    && page.includes('if (isConsolidated)'),
  'Full-tax page must route SALE and CONSOLIDATED_DELIVERY updates to separate authorities.'
);
assert(
  page.includes('lineId: item?.documentSourceLineId'),
  'Consolidated saves must target the persisted consolidated line id.'
);

console.log('Consolidated Document Line Editor Contract: PASS');
