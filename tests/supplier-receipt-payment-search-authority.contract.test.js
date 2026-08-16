import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx');
const source = fs.readFileSync(file, 'utf8');

const expectIncludes = (value, message) => {
  if (!source.includes(value)) throw new Error(message);
};

expectIncludes(
  "getReceiptsReadyToPay } from '@/features/purchaseOrderReceipt/api/purchaseOrderReceiptApi'",
  'Supplier receipt payment must use the existing receipt-ready-to-pay API authority directly.',
);
expectIncludes('const supplierIdRef = useRef(supplierId);', 'Current supplier authority must be tracked synchronously.');
expectIncludes('const receiptSearchRequestRef = useRef(0);', 'Receipt searches must have request sequencing authority.');
expectIncludes('supplierIdRef.current !== supplierIdSnapshot || receiptSearchRequestRef.current !== requestId', 'Stale supplier/search responses must be rejected.');
expectIncludes('setReceiptsReadyToPay(normalized);', 'Only the owned receipt-search result may update local discovery state.');
expectIncludes('`supplier-payment:receipt:${supplierIdSnapshot}:search:error`', 'Receipt-search error feedback must be supplier scoped.');
expectIncludes('if (submittingRef.current) return { ok: false, busy: true };', 'Receipt discovery must not race payment persistence.');

if (source.includes('loadReceiptsReadyToPayAction')) {
  throw new Error('Supplier receipt payment must not depend on the missing store action.');
}

console.log('Supplier Receipt Payment Search Authority Contract: PASS');
