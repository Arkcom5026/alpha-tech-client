import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  projectSaleCompletionErrorMessage,
} from '../src/features/sales/create/completion/presentation/saleCompletionErrorMessage';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hookSource = fs.readFileSync(
  path.join(root, 'src/features/sales/create/completion/hooks/useSaleCompletion.js'),
  'utf8'
);

describe('Sale Completion customer branch error authority', () => {
  it('projects a clear Thai action for cross-store or forged customer identity', () => {
    expect(
      projectSaleCompletionErrorMessage({
        code: 'SALE_CUSTOMER_NOT_ACCESSIBLE_IN_BRANCH',
        message: 'Customer was not found in the authenticated store',
      })
    ).toBe('ไม่พบลูกค้ารายนี้ในร้านปัจจุบัน กรุณาค้นหาและเลือกลูกค้าของร้านอีกครั้ง');
  });

  it('preserves other canonical server messages', () => {
    expect(
      projectSaleCompletionErrorMessage({
        code: 'STOCK_CONFLICT',
        message: 'Stock changed during completion',
      })
    ).toBe('Stock changed during completion');
  });

  it('keeps checkout state and routes the server code through the completion hook', () => {
    expect(hookSource).toContain('projectSaleCompletionErrorMessage');
    expect(hookSource).toContain('payload?.code || error?.code || failure?.code');
    expect(hookSource).not.toContain('clearCart');
    expect(hookSource).not.toContain('setCustomerId(null)');
  });
});
