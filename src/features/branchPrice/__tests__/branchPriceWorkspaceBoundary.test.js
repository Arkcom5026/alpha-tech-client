import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('branch price workspace boundary', () => {
  it('keeps the route page as a thin workspace adapter', () => {
    const page = read('pages/ManageBranchPricePage.jsx');
    expect(page).toContain('ManageBranchPriceWorkspace');
    expect(page).not.toContain('useEffect');
    expect(page).not.toContain('useBranchPriceStore');
    expect(page).not.toContain('useProductStore');
  });

  it('moves runtime orchestration into the workspace', () => {
    const workspace = read('workspace/ManageBranchPriceWorkspace.jsx');
    expect(workspace).toContain('useBranchPriceStore');
    expect(workspace).toContain('useProductStore');
    expect(workspace).toContain('fetchAllProductsWithPriceByTokenAction');
    expect(workspace).toContain('updateMultipleBranchPricesAction');
    expect(workspace).toContain('pendingList');
    expect(workspace).toContain('committedSearchText');
  });

  it('does not move branch price routing into the feature workspace', () => {
    const workspace = read('workspace/ManageBranchPriceWorkspace.jsx');
    expect(workspace).not.toContain('react-router-dom');
    expect(workspace).not.toContain('useNavigate');
  });
});
