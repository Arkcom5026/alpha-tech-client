import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const customerReceiptLayout = read('src/features/customerReceipt/components/CustomerReceiptPrintLayout.jsx');
const customerReceiptRenderer = read('src/features/customerReceipt/components/CustomerReceiptA4Document.jsx');
const customerReceiptShell = read('src/features/customerReceipt/print/workspace/components/CustomerReceiptPrintShell.jsx');
const customerReceiptReprint = read('src/features/customerReceipt/reprint/pages/ReprintCustomerReceiptPage.jsx');
const customerMoneyReceipt = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx');
const deliveryCreditSettlement = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx');
const globalCss = read('src/index.css');

const assert = (condition, message) => { if (!condition) throw new Error(message); };

assert(
  customerReceiptLayout.includes("import CustomerReceiptA4Document from './CustomerReceiptA4Document'")
    && customerReceiptLayout.includes('<CustomerReceiptA4Document')
    && !customerReceiptLayout.includes("@/features/bill/components/FullTaxA4Document")
    && !customerReceiptLayout.includes('BillLayoutFullTax'),
  'Customer Receipt A4 must use its module-owned renderer.'
);

assert(
  customerReceiptRenderer.includes('customer-receipt-a4-page')
    && customerReceiptRenderer.includes('LAST_PAGE_ROWS = 20')
    && customerReceiptRenderer.includes('@page { size: A4; margin: 4mm; }')
    && customerReceiptRenderer.includes('width:201mm!important;')
    && customerReceiptRenderer.includes('height:288mm!important;')
    && customerReceiptRenderer.includes('border-radius:2.5mm!important;'),
  'Customer Receipt must independently own the visual A4 standard.'
);

assert(
  customerReceiptShell.includes("margin: ${printMode === 'SHORT' ? '0' : '4mm'};")
    && customerReceiptShell.includes("position: ${printMode === 'SHORT' ? 'absolute' : 'static'} !important;")
    && customerReceiptShell.includes("var(--document-font-family"),
  'Customer Receipt print shell must preserve thermal isolation while adopting the low-level A4 paper margin and typography.'
);

assert(
  customerReceiptReprint.includes("margin: ${printMode === 'SHORT' ? '0' : '4mm'};")
    && customerReceiptReprint.includes("position: ${printMode === 'SHORT' ? 'absolute' : 'static'} !important;")
    && customerReceiptReprint.includes('<CustomerReceiptPrintLayout receipt={selectedItem} />'),
  'Customer Receipt reprint A4 must reuse its own module receipt renderer without retaining legacy 10mm A4 geometry.'
);

assert(
  customerMoneyReceipt.includes("'credit-collection-a4 text-[14px]'")
    && customerMoneyReceipt.includes('<div role="banner" className="credit-collection-header')
    && customerMoneyReceipt.includes("margin: ${mode === 'SHORT' ? '0' : '4mm'};")
    && customerMoneyReceipt.includes('print:min-h-0'),
  'Customer Money Receipt A4 must keep its own document component while using the low-level paper frame standard.'
);

assert(
  deliveryCreditSettlement.includes("'credit-collection-a4 max-w-[190mm] p-8 text-sm'")
    && deliveryCreditSettlement.includes('margin: 4mm;')
    && deliveryCreditSettlement.includes('print:min-h-0'),
  'Delivery Credit Settlement A4 must keep its own document layout while adopting the 4mm print-safe boundary.'
);

assert(
  globalCss.includes('.credit-collection-a4 {')
    && globalCss.includes('width: 201mm !important;')
    && globalCss.includes('min-height: 288mm !important;')
    && globalCss.includes('padding: 5mm !important;')
    && globalCss.includes('border: 0.3mm solid #444 !important;')
    && globalCss.includes('border-radius: 2.5mm !important;')
    && globalCss.includes('font-family: var(--document-font-family) !important;'),
  'Only low-level paper geometry and typography may be shared across receipt/settlement modules.'
);

console.log('A4 Document Standardization Wave 2 Contract: PASS');
