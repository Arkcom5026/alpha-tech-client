import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('ready-to-sell scanner page lifecycle contract', () => {
  const page = read('src/features/product/pages/ReadyToSellStructuredDetailsPage.jsx');

  it('preserves server-search debounce and store cleanup ownership', () => {
    expect(page).toContain('setTimeout(() => setCommitted(searchText.trim()), 250)');
    expect(page).toContain("if (typeof resetAction === 'function') resetAction()");
    expect(page).toContain('fetchReadyToSellStructuredDetailsAction');
  });

  it('keeps scan focus lifecycle protected by scan mode and operational identity', () => {
    expect(page).toContain('if (scanMode && scanRef.current) scanRef.current.focus()');
    expect(page).toMatch(/\[scanMode, pid, branchId\]/);
  });

  it('preserves Enter-to-scan and clears scan input after submission', () => {
    expect(page).toContain("if (e.key === 'Enter')");
    expect(page).toContain('tryScanJump(v)');
    expect(page).toContain("setScanText('')");
  });

  it('keeps row highlight and scroll behavior fail-soft', () => {
    expect(page).toContain('setHighlightId(id)');
    expect(page).toContain('document.getElementById(`sn-row-${id}`)');
    expect(page).toContain("el.scrollIntoView({ behavior: 'smooth', block: 'center' })");
    expect(page).toContain("setScanMessage(`ไม่พบรายการสำหรับ “${s}”`)");
  });

  it('keeps scanner behavior local to this read-only stock-detail surface', () => {
    expect(page).not.toMatch(/receiveSNAction|createStockItem|updateStockItem|deleteStockItem/);
  });
});
