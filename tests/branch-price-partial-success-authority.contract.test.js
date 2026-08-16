import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('src/features/branchPrice/workspace/ManageBranchPriceWorkspace.jsx', 'utf8');

describe('branch price partial-success mutation authority', () => {
  it('keeps a synchronous mutation owner and immutable command snapshots', () => {
    expect(source).toContain('const savingRef = useRef(false);');
    expect(source).toContain('if (pendingList.length === 0 || saving || savingRef.current) return;');
    expect(source).toContain('const updates = pendingList.map((item) => ({');
    expect(source).toContain('const refreshFilters = {');
    expect(source).toContain('savingRef.current = true;');
    expect(source).toContain('savingRef.current = false;');
  });

  it('separates persistence success from post-success refresh failure', () => {
    const persistenceIndex = source.indexOf('await updateMultipleBranchPricesAction(updates);');
    const successIndex = source.indexOf("'branch-price:update:success'");
    const refreshIndex = source.indexOf('await fetchAllProductsWithPriceByTokenAction(refreshFilters);');
    const refreshErrorIndex = source.indexOf("'branch-price:update:refresh:error'");

    expect(persistenceIndex).toBeGreaterThan(-1);
    expect(successIndex).toBeGreaterThan(persistenceIndex);
    expect(refreshIndex).toBeGreaterThan(successIndex);
    expect(refreshErrorIndex).toBeGreaterThan(refreshIndex);
    expect(source).toContain('บันทึกราคาสินค้าสำเร็จแล้ว แต่รีเฟรชรายการราคาล่าสุดไม่สำเร็จ');
  });

  it('retains a distinct persistence failure outcome', () => {
    expect(source).toContain("'branch-price:update:error'");
    expect(source).toContain('บันทึกการเปลี่ยนราคาสินค้าไม่สำเร็จ');
  });
});
