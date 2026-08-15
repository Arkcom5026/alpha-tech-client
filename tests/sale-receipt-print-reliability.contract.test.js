import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

const controller = read('src/features/sales/create/payment/controllers/salePaymentConfirmationController.js');
const handoff = read('src/features/sales/create/document-handoff/hooks/useSaleDocumentHandoff.js');
const route = read('src/features/sales/documents/saleDocumentRoute.js');
const summary = read('src/features/sales/create/components/PaymentSummary.jsx');

assertIncludes(
  controller,
  "const openShortReceiptFallback = ({ saleId, saleOption, onSaleConfirmed, confirmContext }) =>",
  'Cash-sale receipt reliability requires an explicit fallback handoff helper'
);
assertIncludes(
  controller,
  "if (saleOption !== 'RECEIPT' || typeof onSaleConfirmed !== 'function') return false;",
  'Fallback must apply only to the short tax receipt option'
);
assertIncludes(
  controller,
  "onSaleConfirmed(saleId, 'RECEIPT', confirmContext);",
  'Fallback must hand off the completed sale id to the legacy short receipt route'
);
assertIncludes(
  controller,
  "if (!fallbackOpened) closeReservedPrintWindow(confirmContext);",
  'Successful fallback must not be closed as a failed post-sale document handoff'
);
assertIncludes(
  controller,
  "fallbackOpened,",
  'Post-sale warning must retain evidence that fallback document handoff occurred'
);
assertIncludes(
  handoff,
  'openCompletedSaleDocument',
  'Confirmed-sale document handoff must remain centralized'
);
assertIncludes(
  route,
  "if (option === 'RECEIPT') return `/${slug}/pos/sales/print-short/${id}`;",
  'Receipt fallback must resolve to the canonical sale short-print route'
);
assertIncludes(
  summary,
  'pos-sale-completion-warning',
  'Tax authority failure must remain visible even when receipt fallback succeeds'
);

console.log('Sale receipt print reliability contract: PASS');
