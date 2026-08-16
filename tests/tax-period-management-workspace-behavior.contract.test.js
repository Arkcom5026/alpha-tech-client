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
    expect(page).toContain('return { ok: true };');
    expect(page).toContain('return { ok: false, error: requestError, message };');
  });

  it('resets transient selection and filters when branch authority changes', () => {
    expect(page).toContain('setSelectedPeriodId(null);');
    expect(page).toContain("setStatusFilter('');");
    expect(page).toContain("setSearchText('');");
    expect(page).toContain("setFromDate('');");
    expect(page).toContain("setToDate('');");
    expect(page).toContain('}, [branchId]);');
  });

  it('ensures the current monthly period through a synchronous authority lock and refreshes the same workspace', () => {
    expect(page).toContain('const mutationRef = useRef(false);');
    expect(page).toContain('const interactionBusy = Boolean(busyKey) || mutationRef.current;');
    expect(page).toContain('const targetBranchId = branchId;');
    expect(page).toContain('mutationRef.current = true;');
    expect(page).toContain("setBusyKey('ensure');");
    expect(page).toContain('const result = await ensureMonthlyTaxPeriod({ branchId: targetBranchId });');
    expect(page).toContain("result?.created ? 'สร้างรอบภาษีประจำเดือนเรียบร้อยแล้ว' : 'รอบภาษีประจำเดือนนี้มีอยู่แล้ว'");
    expect(page).toContain('const refresh = await loadData({ reportError: false });');
    expect(page).toContain('บันทึกรอบภาษีสำเร็จแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ');
    expect(page).toContain('mutationRef.current = false;');
    expect(page).toContain("setBusyKey('');");
  });

  it('preserves confirmed transition payloads, replay feedback, snapshots, and refresh semantics', () => {
    expect(page).toContain('const meta = ACTION_META[action];');
    expect(page).toContain('setPendingAction({ period, action });');
    expect(page).toContain('const confirmAction = async () =>');
    expect(page).toContain('<ConfirmActionDialog');
    expect(page).toContain('open={Boolean(pendingAction)}');
    expect(page).toContain('const taxPeriodId = period.id;');
    expect(page).toContain('const occurredAt = new Date().toISOString();');
    expect(page).toContain('const key = `${taxPeriodId}:${action}`;');
    expect(page).toContain('const result = await transitionTaxPeriod({');
    expect(page).toContain('branchId: targetBranchId');
    expect(page).toContain('taxPeriodId,');
    expect(page).toContain('action,');
    expect(page).toContain('occurredAt,');
    expect(page).toContain("result?.replayed ? 'สถานะนี้ถูกบันทึกไว้แล้ว' : 'อัปเดตสถานะรอบภาษีเรียบร้อยแล้ว'");
    expect(page).toContain('const refresh = await loadData({ reportError: false });');
    expect(page).toContain('อัปเดตสถานะรอบภาษีสำเร็จแล้ว แต่โหลดข้อมูลล่าสุดไม่สำเร็จ');
  });

  it('keeps client search, guarded period selection, and available actions intact across workspace ownership', () => {
    expect(page).toContain("const keyword = searchText.trim().toLowerCase();");
    expect(page).toContain("String(period?.periodCode || '').toLowerCase().includes(keyword)");
    expect(page).toContain('currentPeriod={summary?.currentPeriod}');
    expect(page).toContain('if (!interactionBusy) setSelectedPeriodId(periodId);');
    expect(listTable).toContain('const actions = Array.isArray(period.availableActions) ? period.availableActions : [];');
    expect(page).toContain('onAction={handleAction}');
    expect(page).toContain('if (!interactionBusy) setSelectedPeriodId(null);');
  });
});
