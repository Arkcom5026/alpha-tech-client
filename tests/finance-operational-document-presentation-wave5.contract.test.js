import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const capability = read('src/features/printing/presentation/presentationCapabilityRegistry.js');
const resolver = read('src/features/printing/presentation/financeOperationalPresentation.js');
const footer = read('src/features/printing/presentation/FinanceOperationalPresentationFooter.jsx');

for (const code of ['CUSTOMER_MONEY_RECEIPT', 'DELIVERY_CREDIT_SETTLEMENT', 'REFUND_RECEIPT']) {
  assert(capability.includes(`${code}: FINANCE_MIXED`), `${code} must use the shared finance-operational profile.`);
}

assert(capability.includes("protectedBlocks: ['DOCUMENT_META', 'PARTY', 'TOTALS', 'SYSTEM_NOTICE']"), 'SYSTEM_NOTICE must remain protected.');
assert(!capability.includes("storeBlocks: ['STORE_HEADER', 'NOTES', 'SIGNATURES', 'SYSTEM_NOTICE'"), 'Store settings must never own SYSTEM_NOTICE.');
assert(resolver.includes("blockContent(presentation, 'NOTES')"));
assert(resolver.includes("blockContent(presentation, 'CUSTOM_FOOTER')"));
assert(footer.includes('finance-operational-system-notice'));
assert(footer.includes('finance-operational-custom-footer'));
assert(footer.includes('systemNotices = []'));

console.log('Finance Operational Document Presentation Wave 5 Contract: PASS');
