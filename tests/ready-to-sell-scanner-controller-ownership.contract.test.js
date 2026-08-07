import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('ready-to-sell scanner controller ownership contract', () => {
  const controller = read(
    'src/features/product/ready-to-sell/scan-workflow/hooks/useReadyToSellScannerController.js',
  );
  const policy = read(
    'src/features/product/ready-to-sell/scan-workflow/policies/readyToSellScannerPolicy.js',
  );

  it('keeps scan matching and sorting policy-owned', () => {
    expect(controller).toContain('matchReadyToSellScan');
    expect(controller).toContain('sortReadyToSellRows');
    expect(policy).toContain('matchReadyToSellScan');
    expect(policy).toContain('sortReadyToSellRows');
  });

  it('owns scanner focus behind one controller boundary', () => {
    expect(controller).toContain('focusScanInput');
    expect(controller).toContain('scanInputRef');
    expect(controller).toContain('node.focus()');
    expect(controller).toContain('if (!scanMode || !branchId || !productId) return;');
    expect(controller).toContain('if (!node || node.disabled) return;');
  });

  it('keeps highlight and scroll fail-soft', () => {
    expect(controller).toContain('document.getElementById(`sn-row-${id}`)');
    expect(controller).toContain("el.scrollIntoView({ behavior: 'smooth', block: 'center' });");
    expect(controller).toContain('setHighlightId(outcome.highlightId ?? null)');
    expect(controller).toContain("setScanMessage(outcome.message || '')");
  });

  it('keeps Enter submission and mode toggles local to scanner state', () => {
    expect(controller).toContain("setScanText('')");
    expect(controller).toContain('toggleScanMode');
    expect(controller).toContain('toggleSortMode');
  });

  it('does not own product fetching or mutations', () => {
    expect(controller).not.toContain('fetchReadyToSellStructuredDetailsAction');
    expect(controller).not.toContain('resetReadyToSellStructuredDetailsAction');
    expect(controller).not.toContain('apiClient');
  });
});
