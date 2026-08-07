import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const header = read('src/features/stockItem/receive/scan-workflow/components/StockItemScanWorkspaceHeader.jsx');
const summary = read('src/features/stockItem/receive/scan-workflow/components/StockItemScanSummary.jsx');
const controls = read('src/features/stockItem/receive/scan-workflow/components/StockItemScanControls.jsx');

describe('StockItem scan workspace modernization contract', () => {
  it('uses workspace components with system-teal primary actions', () => {
    expect(header).toContain('bg-teal-700');
    expect(controls).toContain('bg-teal-700');
    expect(header).toContain('min-h-11');
    expect(controls).toContain('min-h-11');
  });

  it('keeps scan controls presentation-only', () => {
    expect(controls).not.toContain('receiveSNAction');
    expect(controls).not.toContain('useStockItemScanRuntimeController');
    expect(controls).not.toContain('requestAnimationFrame');
    expect(controls).not.toContain('.focus(');
  });

  it('keeps optional serial mode explicit in the control surface', () => {
    expect(controls).toContain('type="checkbox"');
    expect(controls).toContain('เก็บ Serial Number');
    expect(controls).toContain('ไม่บังคับ');
  });

  it('keeps operational summary presentation separated from runtime behavior', () => {
    expect(summary).toContain('ทั้งหมด');
    expect(summary).toContain('รับแล้ว');
    expect(summary).toContain('ค้างรับ');
    expect(summary).not.toContain('useStockItem');
  });
});
