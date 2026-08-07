import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('tax period management workspace behavior contract', () => {
  const page = read('src/features/tax/periods/pages/TaxPeriodManagementPage.jsx');
  const listTable = read('src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx');

  it('keeps branch selection as the runtime authority', () => {
    expect(page).toContain('const selectedBranchId = useBranchStore((state) => state.selectedBranchId);');
    expect(page).toContain('const currentBranch = useBranchStore((state) => state.currentBranch);');
    expect(page).toContain('const ensureSelectedBranchAction = useBranchStore((state) => state.ensureSelectedBranchAction);');
    expect(page).toContain('const branchId = Number(selectedBranchId || currentBranch?.id || 0) || null;');
    expect(page).toContain('Promise.resolve(ensureSelectedBranchAction?.()).catch(() => {});');
  });

  it('loads summary and period list together under the selected branch and filters', () => {
    expect(page).toContain('const [summaryResult, listResult] = await Promise.all([');
    expect(page).toContain('getTaxPeriodSummary({ branchId })');
    expect(page).toContain('listTaxPeriods({');
    expect(page).toContain('branchId,');
    expect(page).toContain('status: statusFilter || undefined');
    expect(page).toContain('fromDate: fromDate || undefined');
    expect(page).toContain('toDate: toDate || undefined');
    expect(page).toContain('setSummary(summaryResult || null);');
    expect(page).toContain('setPeriods(Array.isArray(listResult?.periods) ? listResult.periods : []);');
  });

  it('resets transient selection and filters when branch authority changes', () => {
    expect(page).toContain('setSelectedPeriodId(null);');
    expect(page).toContain("setStatusFilter('');");
    expect(page).toContain("setSearchText('');");
    expect(page).toContain("setFromDate('');");
    expect(page).toContain("setToDate('');");
    expect(page).toContain('}, [branchId]);');
  });

  it('ensures the current monthly period and refreshes through the same load authority', () => {
    expect(page).toContain("setBusyKey('ensure');");
    expect(page).toContain('const result = await ensureMonthlyTaxPeriod({ branchId });');
    expect(page).toContain("result?.created ? 'สร้างรอบภาษีประจำเดือนเรียบร้อยแล้ว' : 'รอบภาษีประจำเดือนนี้มีอยู่แล้ว'");
    expect(page).toContain('await loadData();');
    expect(page).toContain("setBusyKey('');");
  });

  it('preserves confirmed transition payloads, replay feedback, and refresh semantics', () => {
    expect(page).toContain('const meta = ACTION_META[action];');
    expect(page).toContain('if (!meta || !window.confirm(meta.confirm)) return false;');
    expect(page).toContain('const key = `${period.id}:${action}`;');
    expect(page).toContain('const result = await transitionTaxPeriod({');
    expect(page).toContain('taxPeriodId: period.id');
    expect(page).toContain('action,');
    expect(page).toContain('occurredAt: new Date().toISOString()');
    expect(page).toContain("result?.replayed ? 'สถานะนี้ถูกบันทึกไว้แล้ว' : 'อัปเดตสถานะรอบภาษีเรียบร้อยแล้ว'");
    expect(page).toContain('await loadData();');
  });

  it('keeps client search, current-period selection, and available actions intact across workspace ownership', () => {
    expect(page).toContain("const keyword = searchText.trim().toLowerCase();");
    expect(page).toContain("String(period?.periodCode || '').toLowerCase().includes(keyword)");
    expect(page).toContain('currentPeriod={summary?.currentPeriod}');
    expect(page).toContain('onOpen={setSelectedPeriodId}');
    expect(listTable).toContain('const actions = Array.isArray(period.availableActions) ? period.availableActions : [];');
    expect(page).toContain('onAction={handleAction}');
    expect(page).toContain('onClose={() => setSelectedPeriodId(null)}');
  });
});
