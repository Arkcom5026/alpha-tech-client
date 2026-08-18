import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const includes = (source, token) => { if (!source.includes(token)) throw new Error(`Missing client lineage contract: ${token}`); };

const quotationApi = read('src/features/quotation/api/quotationApi.js');
const quotationLineagePanel = read('src/features/quotation/components/QuotationDocumentLineagePanel.jsx');
const quotationPrintLineagePage = read('src/features/quotation/pages/QuotationPrintLineagePage.jsx');
const salesRoutes = read('src/routes/partner/salesRoutes.jsx');
const salePage = read('src/features/sales/create/pages/CreateSalePage.jsx');
const hydration = read('src/features/sales/create/customer/hooks/useSaleCustomerHydration.js');
const payload = read('src/features/sales/create/completion/services/saleCompletionPayload.js');
const paymentSection = read('src/features/sales/create/components/PaymentSection.jsx');
const paymentHook = read('src/features/sales/create/payment/hooks/useSalePaymentWorkflow.js');
const paymentController = read('src/features/sales/create/payment/controllers/salePaymentConfirmationController.js');
const documentApi = read('src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js');
const deliveryShell = read('src/features/deliveryNote/print/workspace/components/DeliveryNotePrintShell.jsx');

includes(quotationApi, 'export const getQuotationDocumentLineage');
includes(quotationApi, 'export const listQuotationReferenceCandidates');
includes(quotationApi, '/sales/quotations/reference-candidates?');
for (const token of [
  'getQuotationDocumentLineage(quotationId)',
  "document.querySelector('.quotation-print-shell')",
  "shell?.querySelector('.quotation-a4')",
  'new MutationObserver',
  "observer.observe(document.body, { childList: true, subtree: true })",
  'shell.insertBefore(host, a4)',
  'data-testid="quotation-document-lineage"',
  'เอกสารที่อ้างอิงใบเสนอราคานี้',
  'การขาย:',
  'ใบส่งของ:',
  'เอกสารภาษี:',
  'print:hidden',
]) includes(quotationLineagePanel, token);
for (const token of [
  '<QuotationPrintPage />',
  '<QuotationDocumentLineagePanel quotationId={quotationId} shopSlug={shopSlug} />',
]) includes(quotationPrintLineagePage, token);
includes(salesRoutes, "import QuotationPrintLineagePage from '@/features/quotation/pages/QuotationPrintLineagePage';");
includes(salesRoutes, "{ path: 'quotations/:quotationId/print', element: <QuotationPrintLineagePage /> }");
for (const token of [
  'const quotationWorkflowEnabled = Boolean(',
  'selectedCustomer?.quotationWorkflowEnabled === true',
  'if (!quotationWorkflowEnabled) return () => { alive = false; };',
  'listQuotationReferenceCandidates(customerId)',
  'Array.isArray(result?.candidates) ? result.candidates : []',
  "setSourceQuotationId('');",
  'quotationWorkflowEnabled && acceptedQuotations.length > 0',
  'data-testid="sale-source-quotation-select"',
  'แสดงเฉพาะใบเสนอราคาที่ตอบรับแล้วของลูกค้ารายนี้',
  'sourceQuotationId={sourceQuotationId}',
]) includes(salePage, token);
if (salePage.includes("listQuotations({ status: 'ACCEPTED'")) {
  throw new Error('Sale workspace must not preload accepted quotations across all customers');
}
if (salePage.indexOf('if (!quotationWorkflowEnabled)') > salePage.indexOf('listQuotationReferenceCandidates(customerId)')) {
  throw new Error('Quotation candidate lookup must be gated before the request is made');
}
for (const token of [
  '...baseCustomer,',
  'useCustomerDepositStore.getState().setSelectedCustomer(fullCustomer)',
]) includes(hydration, token);
includes(payload, 'sourceQuotationId: options.sourceQuotationId ? Number(options.sourceQuotationId) : null');
includes(paymentSection, 'sourceQuotationId = null');
includes(paymentHook, 'sourceQuotationId,');
includes(paymentController, 'sourceQuotationId: sourceQuotationId || undefined');
includes(documentApi, '`/sales/${saleId}/quotation-reference`');
includes(documentApi, 'sourceQuotation: sourceQuotation || null');
for (const token of [
  "import { useNavigate, useParams } from 'react-router-dom';",
  'data-testid="delivery-note-source-quotation"',
  'data-testid="delivery-note-source-quotation-link"',
  'อ้างอิงใบเสนอราคา:',
  'sale.sourceQuotation.code',
  'sale.sourceQuotation.revisionNumber',
  'sale?.sourceQuotation?.id || sale?.sourceQuotation?.quotationId || null',
  "`/${shopSlug || 'advancetech'}/pos/sales/quotations/${sourceQuotationId}/print`",
  'onClick={() => navigate(quotationPath)}',
  'เปิดใบเสนอราคา',
]) includes(deliveryShell, token);

if (/quotation.*items|items.*quotation/i.test(payload)) {
  throw new Error('Sale completion payload must not derive sale lines from quotation items');
}

console.log('Quotation Document Lineage Authority Client Contract: PASS');
