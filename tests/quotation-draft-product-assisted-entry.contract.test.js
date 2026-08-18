import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const includes = (source, token) => { if (!source.includes(token)) throw new Error(`Missing product-assisted quotation contract: ${token}`); };

const panel = read('src/features/quotation/components/QuotationDraftProductAssistantPanel.jsx');
const wrapper = read('src/features/quotation/pages/QuotationPrintLineagePage.jsx');
const quotationPage = read('src/features/quotation/pages/QuotationPrintPage.jsx');

for (const token of [
  "getProductsForPos({ search: text, take: 20, readyOnly: false, hasPrice: false, activeOnly: true })",
  'sourceProductId: Number(product.id)',
  'title: product.name',
  "unitName: product.unitName || product.unit?.name || ''",
  'quantity: 1',
  "quotation?.status !== 'DRAFT'",
  'data-testid="quotation-draft-product-assistant"',
  'ไม่จองสต๊อก',
  'กำหนดราคาเอง',
  'new MutationObserver',
  "shell.insertBefore(node, a4)",
  'print:hidden',
]) includes(panel, token);

includes(wrapper, "import QuotationDraftProductAssistantPanel from '../components/QuotationDraftProductAssistantPanel';");
includes(wrapper, '<QuotationDraftProductAssistantPanel quotationId={quotationId} />');

for (const token of [
  'sourceProductId: item.sourceProductId || null',
  "setEditingLineId('NEW')",
  'พิมพ์เองได้ทั้งหมด ไม่จำเป็นต้องอ้างอิงสินค้า',
]) includes(quotationPage, token);

if (panel.includes('readyOnly: true')) throw new Error('Quotation product assistance must not require ready stock');
if (panel.includes('hasPrice: true')) throw new Error('Quotation product assistance must not require a configured price');

console.log('Quotation Draft Product-Assisted Entry Contract: PASS');
