import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Payment Online compound mutation authority', () => {
  it('serializes the form boundary synchronously and snapshots user input', () => {
    const source = read('src/features/paymentOnline/components/PaymentOnlineForm.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('if (!file || isSubmitting || submittingRef.current) return;');
    expect(source).toContain('const orderIdSnapshot = orderId;');
    expect(source).toContain('const fileSnapshot = file;');
    expect(source).toContain('const noteSnapshot = note;');
    expect(source).toContain("formData.append('slip', fileSnapshot);");
    expect(source).toContain('await submitPaymentSlipAction(orderIdSnapshot, formData, { note: noteSnapshot });');
  });

  it('owns upload plus slip metadata persistence as one store mutation', () => {
    const source = read('src/features/paymentOnline/store/paymentOnlineStore.js');
    expect(source).toContain('submitPaymentSlipAction: async (orderId, formData, payload) => {');
    expect(source).toContain('const orderIdSnapshot = orderId;');
    expect(source).toContain('const payloadSnapshot = { ...payload };');
    expect(source).toContain('uploadedSlipUrl = await uploadPaymentSlip(orderIdSnapshot, formData);');
    expect(source).toContain('const result = await submitOrderOnlinePaymentSlip(orderIdSnapshot, {');
    expect(source).toContain('slipUrl: uploadedSlipUrl,');
  });

  it('distinguishes upload failure from metadata partial success failure', () => {
    const source = read('src/features/paymentOnline/store/paymentOnlineStore.js');
    expect(source).toContain('`payment-online:${orderIdSnapshot}:upload:error`');
    expect(source).toContain('`payment-online:${orderIdSnapshot}:submit-after-upload:error`');
    expect(source).toContain('อัปโหลดสลิปสำเร็จแล้ว แต่ส่งข้อมูลการชำระเงินไม่สำเร็จ');
    expect(source).toContain('`payment-online:${orderIdSnapshot}:submit:success`');
  });

  it('routes the canonical page through the compound action only', () => {
    const source = read('src/features/paymentOnline/pages/PaymentOnlinePage.jsx');
    expect(source).toContain('submitPaymentSlipAction={submitPaymentSlipAction}');
    expect(source).not.toContain('uploadSlipAction={uploadSlipAction}');
  });
});
