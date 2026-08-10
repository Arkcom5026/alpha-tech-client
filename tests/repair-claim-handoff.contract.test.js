import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('repair warranty claim handoff contract', () => {
  it('loads claim options from the repair boundary and never asks for raw supplier id', () => {
    const api = read('src/features/repair/api/repairApi.js');
    const panel = read('src/features/repair/components/RepairClaimHandoffPanel.jsx');
    const runtime = read('src/features/repair/components/JobRuntimePanel.jsx');

    expect(api).toContain('/warranty-claim-options');
    expect(panel).toContain('getClaimOptions');
    expect(panel).toContain("supplierSelectionMode === 'SOURCE_LOCKED'");
    expect(panel).toContain('ล็อกจากประวัติการรับเข้าสินค้า');
    expect(panel).not.toContain('placeholder="Supplier ID"');
    expect(runtime).not.toContain('Supplier ID');
  });

  it('keeps source supplier locked and uses a guided select only when branch selection is allowed', () => {
    const panel = read('src/features/repair/components/RepairClaimHandoffPanel.jsx');

    expect(panel).toContain('sourceLocked');
    expect(panel).toContain('<select');
    expect(panel).toContain('sourceSupplierId');
    expect(panel).toContain('เปิดรายการเคลมจากงานซ่อม');
  });

  it('mounts claim handoff as a dedicated repair runtime panel', () => {
    const workspace = read('src/features/repair/detail/workspace/components/RepairDetailWorkspace.jsx');

    expect(workspace).toContain('RepairClaimHandoffPanel');
    expect(workspace).toContain('onOpenClaim={onOpenClaim}');
  });
});
