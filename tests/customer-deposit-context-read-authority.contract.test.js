import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/features/customerDeposit/store/customerDepositStore.js', 'utf8');

describe('customer deposit shared context read authority contract', () => {
  it('uses one sequence for customer/deposit context reads', () => {
    expect(source).toContain('let customerDepositContextRequestSequence = 0');
    expect(source).toContain('beginCustomerDepositContextRequest');
    expect(source).toContain('ownsCustomerDepositContextRequest');
    expect(source).toContain('invalidateCustomerDepositContextRequests');
  });

  it('freezes phone/name/customer/deposit identities before async reads', () => {
    expect(source).toContain("const phoneSnapshot = String(phone || '').trim()");
    expect(source).toContain("const nameSnapshot = String(name || '').trim()");
    expect(source).toContain('const customerIdSnapshot = Number(customerId)');
    expect(source).toContain('const depositIdSnapshot = Number(id)');
  });

  it('suppresses stale context outcomes', () => {
    expect(source).toMatch(/if \(!ownsCustomerDepositContextRequest\(requestId\)\) return null;/);
    expect(source).toContain('if (ownsCustomerDepositContextRequest(requestId)) set({ isLoadingDetail: false })');
  });

  it('lets mutation and explicit clear/set operations supersede reads', () => {
    expect(source).toMatch(/createCustomerDepositAction:[\s\S]*invalidateCustomerDepositContextRequests\(\)/);
    expect(source).toMatch(/applyDepositUsageAction:[\s\S]*invalidateCustomerDepositContextRequests\(\)/);
    expect(source).toMatch(/clearCustomer:[\s\S]*invalidateCustomerDepositContextRequests\(\)/);
    expect(source).toMatch(/resetAllDepositState:[\s\S]*invalidateCustomerDepositContextRequests\(\)/);
  });
});
