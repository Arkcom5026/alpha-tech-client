import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/features/customer/store/customerStore.js', 'utf8');

describe('customer record read authority contract', () => {
  it('shares one sequence across phone and profile reads that write customer state', () => {
    expect(source).toContain('let customerRecordRequestSequence = 0');
    expect(source).toContain('const requestId = ++customerRecordRequestSequence');
    expect(source).toContain('const ownsRecordRequest = () => customerRecordRequestSequence === requestId');
  });

  it('snapshots phone intent and discards stale success/error/finally writes', () => {
    expect(source).toContain("const phoneSnapshot = String(phone ?? '').trim()");
    expect(source).toMatch(/if \(!ownsRecordRequest\(\)\) return null;/);
    expect(source).toContain('if (ownsRecordRequest()) set({ isLoading: false })');
  });

  it('invalidates outstanding reads before mutations can write customer state', () => {
    expect(source).toContain('const invalidateCustomerRecordReads = () =>');
    expect(source.match(/invalidateCustomerRecordReads\(\);/g)?.length).toBeGreaterThanOrEqual(5);
    expect(source).toContain('if (get().isMutating) return null');
  });

  it('invalidates reads when customer state is replaced or reset explicitly', () => {
    expect(source).toMatch(/setCustomer: \(customer\) => \{[\s\S]*invalidateCustomerRecordReads\(\)/);
    expect(source).toMatch(/resetCustomer: \(\) => \{[\s\S]*invalidateCustomerRecordReads\(\)/);
  });
});
