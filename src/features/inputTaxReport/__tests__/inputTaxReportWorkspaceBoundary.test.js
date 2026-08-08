import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('input tax report workspace boundary', () => {
  it('keeps the list page as a thin workspace adapter', () => {
    const page = read('pages/ListInputTaxReportPage.jsx');
    expect(page).toContain('InputTaxReportListWorkspace');
    expect(page).not.toContain('useBranchStore');
    expect(page).not.toContain('useInputTaxReportStore');
  });

  it('keeps branch/date orchestration in the workspace and print as a dedicated surface', () => {
    const workspace = read('workspaces/InputTaxReportListWorkspace.jsx');
    const printPage = read('pages/PrintInputTaxReportPage.jsx');

    expect(workspace).toContain('useBranchStore');
    expect(workspace).toContain('fetchInputTaxReportAction');
    expect(workspace).toContain('URLSearchParams');
    expect(printPage).toContain('PrintInputTaxReport');
  });
});
