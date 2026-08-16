import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve('src/features/customerDeposit/store/customerDepositStore.js'),
  'utf8',
);

describe('customer deposit list read authority contract', () => {
  it('serializes customer deposit list reads', () => {
    expect(source).toContain('let customerDepositListRequestSequence = 0');
    expect(source).toContain('const beginCustomerDepositListRequest = () => ++customerDepositListRequestSequence');
    expect(source).toContain('const ownsCustomerDepositListRequest = (requestId) => customerDepositListRequestSequence === requestId');
    expect(source).toContain('const requestId = beginCustomerDepositListRequest()');
  });

  it('discards stale list success, error, and finally writes', () => {
    expect(source).toContain('if (!ownsCustomerDepositListRequest(requestId)) return null');
    expect(source).toContain('if (ownsCustomerDepositListRequest(requestId)) set({ isLoading: false })');
  });

  it('invalidates in-flight list reads when canonical list ownership changes', () => {
    expect(source).toContain('invalidateCustomerDepositListRequests()');
    expect(source).toMatch(/setDeposits: \(list\) => \{[\s\S]*?invalidateCustomerDepositListRequests\(\)/);
    expect(source).toMatch(/createCustomerDepositAction:[\s\S]*?invalidateCustomerDepositListRequests\(\)/);
    expect(source).toMatch(/updateCustomerDepositAction:[\s\S]*?invalidateCustomerDepositListRequests\(\)/);
    expect(source).toMatch(/cancelCustomerDepositAction:[\s\S]*?invalidateCustomerDepositListRequests\(\)/);
    expect(source).toMatch(/applyDepositUsageAction:[\s\S]*?invalidateCustomerDepositListRequests\(\)/);
    expect(source).toMatch(/resetAllDepositState:[\s\S]*?invalidateCustomerDepositListRequests\(\)/);
  });
});
