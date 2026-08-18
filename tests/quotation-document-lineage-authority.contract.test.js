import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const includes = (source, token) => { if (!source.includes(token)) throw new Error(`Missing client lineage contract: ${token}`); };

const quotationApi = read('src/features/quotation/api/quotationApi.js');
const salePage = read('src/features/sales/create/pages/CreateSalePage.jsx');
const payload = read('src/features/sales/create/completion/services/saleCompletionPayload.js');
const paymentSection = read('src/features/sales/create/components/PaymentSection.jsx');
const paymentHook = read('src/features/sales/create/payment/hooks/useSalePaymentWorkflow.js');
const paymentController = read('src/features/sales/create/payment/controllers/salePaymentConfirmationController.js');
const documentApi = read('src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js');

includes(quotationApi, 'export const getQuotationDocumentLineage');
for (const token of [
  "listQuotations({ status: 'ACCEPTED', limit: 100 })",
  '.filter((row) => !row.revisedTo)',
  'data-testid="sale-source-quotation-select"',
  'ไม่บังคับ และไม่ดึงรายการสินค้าข้ามเอกสาร',
  'sourceQuotationId={sourceQuotationId}',
]) includes(salePage, token);
includes(payload, 'sourceQuotationId: options.sourceQuotationId ? Number(options.sourceQuotationId) : null');
includes(paymentSection, 'sourceQuotationId = null');
includes(paymentHook, 'sourceQuotationId,');
includes(paymentController, 'sourceQuotationId: sourceQuotationId || undefined');
includes(documentApi, '`/sales/${saleId}/quotation-reference`');
includes(documentApi, 'sourceQuotation: sourceQuotation || null');

if (/quotation.*items|items.*quotation/i.test(payload)) {
  throw new Error('Sale completion payload must not derive sale lines from quotation items');
}

console.log('Quotation Document Lineage Authority Client Contract: PASS');
