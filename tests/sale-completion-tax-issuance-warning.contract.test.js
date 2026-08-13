import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sale completion tax issuance warning contract', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const controller = fs.readFileSync(
    path.join(root, 'src/features/sales/create/payment/controllers/salePaymentConfirmationController.js'),
    'utf8'
  );
  const hook = fs.readFileSync(
    path.join(root, 'src/features/sales/create/payment/hooks/useSalePaymentWorkflow.js'),
    'utf8'
  );
  const projection = fs.readFileSync(
    path.join(root, 'src/features/sales/create/payment/projections/salePaymentWorkflowProjection.js'),
    'utf8'
  );
  const summary = fs.readFileSync(
    path.join(root, 'src/features/sales/create/components/PaymentSummary.jsx'),
    'utf8'
  );

  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  assert(
    controller.includes("message: 'ขายสำเร็จ แต่ออกเอกสารภาษีไม่สำเร็จ'"),
    'Tax issuance failure must be projected as a post-sale warning'
  );
  assert(
    controller.includes('ok: true') && controller.includes('warning: projectPostSaleDocumentWarning'),
    'Post-sale document failure must preserve canonical sale success'
  );
  assert(
    controller.includes("'TAX_DOCUMENT_ISSUANCE_FAILED'"),
    'Tax issuance failure must expose a stable warning code'
  );
  assert(
    controller.includes("printHistoryPath: '../bill'"),
    'Warning must provide a print-history recovery path'
  );
  assert(
    controller.includes("taxIssuerSettingsPath: '../../settings/tax-issuer'"),
    'Warning must provide a tax-issuer settings recovery path'
  );
  assert(
    hook.includes('const [completionWarning, setCompletionWarning] = useState(null)'),
    'Payment workflow must own post-sale warning feedback'
  );
  assert(
    hook.includes('if (result.warning)') && hook.includes('setCompletionWarning(result.warning)'),
    'Successful sale with document warning must preserve the warning in UI state'
  );
  assert(
    projection.includes('warning: completionWarning'),
    'Payment workflow projection must expose completion warning'
  );
  assert(
    summary.includes('pos-sale-completion-warning'),
    'Payment summary must render a dedicated completion warning surface'
  );
  assert(summary.includes('ไปพิมพ์ย้อนหลัง'), 'Warning must offer print-history recovery');
  assert(summary.includes('ตั้งค่าผู้ออกเอกสารภาษี'), 'Warning must offer tax settings recovery');
  assert(
    !summary.includes('ยืนยันการขายล้มเหลว: Request failed with status code 409'),
    'UI must not hard-code a failed-sale message for post-sale issuance failure'
  );

  console.log('Sale completion tax issuance warning contract: PASS');
});
