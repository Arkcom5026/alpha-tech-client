import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const componentPaths = [
  'src/features/tax/periods/workspace/components/TaxPeriodWorkspaceHeader.jsx',
  'src/features/tax/periods/workspace/components/TaxPeriodWorkspaceSummary.jsx',
  'src/features/tax/periods/workspace/components/TaxPeriodCurrentPeriodCard.jsx',
  'src/features/tax/periods/workspace/components/TaxPeriodListTable.jsx',
];

const sources = componentPaths.map(read);
const combined = sources.join('\n');

describe('tax period management workspace presentation contract', () => {
  it('keeps extracted workspace components presentation-only', () => {
    for (const forbidden of [
      'useBranchStore',
      'getTaxPeriodSummary',
      'listTaxPeriods',
      'ensureMonthlyTaxPeriod',
      'transitionTaxPeriod',
      'getTaxPeriodErrorMessage',
    ]) {
      expect(combined).not.toContain(forbidden);
    }
  });

  it('preserves header refresh and current-period preparation controls', () => {
    const header = sources[0];
    expect(header).toContain('ระบบจัดการรอบภาษี');
    expect(header).toContain('onRefresh');
    expect(header).toContain('onEnsureCurrentPeriod');
    expect(header).toContain("busyKey === 'ensure'");
  });

  it('preserves summary and current-period presentation', () => {
    const summary = sources[1];
    const current = sources[2];
    for (const label of ['ทั้งหมด', 'เปิดใช้งาน', 'ปิดรอบแล้ว', 'ล็อกแล้ว', 'ยื่นแล้ว', 'เปิดใหม่']) {
      expect(summary).toContain(label);
    }
    expect(current).toContain('รอบภาษีปัจจุบัน');
    expect(current).toContain('onOpen?.(currentPeriod.id)');
    expect(current).toContain('renderStatus?.(currentPeriod.status)');
  });

  it('preserves list rows, available actions, loading and empty states', () => {
    const table = sources[3];
    expect(table).toContain('visiblePeriods.map((period) =>');
    expect(table).toContain('period.availableActions');
    expect(table).toContain("const key = `${period.id}:${action}`;");
    expect(table).toContain('onAction?.(period, action)');
    expect(table).toContain('กำลังโหลดรอบภาษี...');
    expect(table).toContain('ไม่พบรอบภาษีตามเงื่อนไขที่เลือก');
  });
});
