import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('tax period management workspace cutover contract', () => {
  const page = read('src/features/tax/periods/pages/TaxPeriodManagementPage.jsx');
  const workspaceFiles = [
    'src/features/tax/periods/workspace/components/TaxPeriodWorkspaceHeader.jsx',
    'src/features/tax/periods/workspace/components/TaxPeriodWorkspaceSummary.jsx',
    'src/features/tax/periods/workspace/components/TaxPeriodCurrentPeriodCard.jsx',
    'src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx',
  ].map(read).join('\n');

  it('composes management presentation from workspace owners', () => {
    for (const component of [
      'TaxPeriodWorkspaceHeader',
      'TaxPeriodWorkspaceSummary',
      'TaxPeriodCurrentPeriodCard',
      'TaxPeriodListTable',
      'TaxPeriodListFilters',
      'TaxPeriodDetailPanel',
    ]) {
      expect(page).toContain(`<${component}`);
    }
  });

  it('keeps branch and tax-period mutation authority in the page', () => {
    expect(page).toContain('useBranchStore');
    expect(page).toContain('getTaxPeriodSummary');
    expect(page).toContain('listTaxPeriods');
    expect(page).toContain('ensureMonthlyTaxPeriod');
    expect(page).toContain('transitionTaxPeriod');
    expect(page).toContain('const handleAction = async (period, action) =>');
  });

  it('keeps extracted workspace presentation free of data and mutation authority', () => {
    for (const forbidden of [
      'useBranchStore',
      'getTaxPeriodSummary',
      'listTaxPeriods',
      'ensureMonthlyTaxPeriod',
      'transitionTaxPeriod',
    ]) {
      expect(workspaceFiles).not.toContain(forbidden);
    }
  });

  it('preserves list filters, error feedback, detail selection, and transition intents through props', () => {
    expect(page).toContain('filtersSlot={(');
    expect(page).toContain('error={error}');
    expect(page).toContain('onOpen={setSelectedPeriodId}');
    expect(page).toContain('onAction={handleAction}');
    expect(page).toContain('taxPeriodId={selectedPeriodId}');
    expect(workspaceFiles).toContain('{filtersSlot}');
    expect(workspaceFiles).toContain("error && <div");
  });
});
