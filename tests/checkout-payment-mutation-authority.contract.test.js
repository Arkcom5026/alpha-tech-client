import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Checkout payment mutation authority', () => {
  it('owns payment confirmation with a synchronous submit boundary', () => {
    const source = read('src/features/customer/components/CheckoutForm.jsx');

    expect(source).toContain('const submitRef = useRef(false)');
    expect(source).toContain('if (!stripe || !elements || isLoading || submitRef.current) return');
    expect(source).toContain('const tokenSnapshot = token');
    expect(source).toContain('const stripeSnapshot = stripe');
    expect(source).toContain('const elementsSnapshot = elements');
    expect(source).toContain('submitRef.current = true');
    expect(source).toContain('await stripeSnapshot.confirmPayment');
    expect(source).toContain('await saveOrder(tokenSnapshot, payload)');
    expect(source).toContain('submitRef.current = false');
  });

  it('retains ADS payment/order outcomes around the financial mutation', () => {
    const source = read('src/features/customer/components/CheckoutForm.jsx');

    expect(source).toContain("'checkout.payment.confirm'");
    expect(source).toContain("'checkout.order.persist'");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
  });
});
