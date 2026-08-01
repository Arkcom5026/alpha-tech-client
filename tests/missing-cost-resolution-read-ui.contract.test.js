/* global process */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Missing Cost Resolution queue/detail UI contract', () => {
  it('owns read APIs inside the feature and never sends branchId authority', () => {
    const api = read('src/features/inventoryRecovery/missingCostResolution/api/missingCostResolutionApi.js');
    expect(api).toContain('/inventory-recovery/missing-cost-resolutions');
    expect(api).toContain('/queue');
    expect(api).toContain('/audit-history');
    expect(api).not.toContain('branchId');
  });

  it('wires queue and detail pages under stock routes', () => {
    const routes = read('src/routes/partner/stockRoutes.jsx');
    expect(routes).toContain("path: 'missing-cost-resolutions'");
    expect(routes).toContain("path: 'missing-cost-resolutions/:resolutionId'");
    expect(routes).toContain('MissingCostResolutionQueuePage');
    expect(routes).toContain('MissingCostResolutionDetailPage');
  });

  it('renders branch-safe queue and non-leaking detail error states', () => {
    const queue = read('src/features/inventoryRecovery/missingCostResolution/pages/MissingCostResolutionQueuePage.jsx');
    const detail = read('src/features/inventoryRecovery/missingCostResolution/pages/MissingCostResolutionDetailPage.jsx');
    expect(queue).toContain('รายการจากสาขาอื่นจะไม่ถูกเปิดเผย');
    expect(detail).toContain('ไม่พบรายการในสาขาปัจจุบัน');
    expect(detail).toContain('ประวัติการดำเนินการ');
    expect(detail).toContain('หลักฐานต้นทุน');
  });
});
