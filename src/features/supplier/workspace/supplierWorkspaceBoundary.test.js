import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => fs.readFileSync(path, 'utf8');

const PAGE_WORKSPACE_PAIRS = [
  ['CreateSupplierPage.jsx', 'SupplierCreateWorkspace'],
  ['EditSupplierPage.jsx', 'SupplierEditWorkspace'],
  ['ListSupplierPage.jsx', 'SupplierListWorkspace'],
  ['UpdateSupplierPage.jsx', 'SupplierLegacyUpdateWorkspace'],
  ['ViewSupplierPage.jsx', 'SupplierViewWorkspace'],
];

describe('supplier workspace boundary', () => {
  it.each(PAGE_WORKSPACE_PAIRS)('%s remains a thin route adapter', (pageFile, workspaceName) => {
    const page = read(`src/features/supplier/pages/${pageFile}`);
    expect(page).toContain(`../workspace/${workspaceName}`);
    expect(page).toContain(`<${workspaceName} />`);
    expect(page).not.toContain('useEffect');
    expect(page).not.toContain('useSupplierStore');
    expect(page).not.toContain('getSupplierById');
  });

  it('keeps table presentation free from router ownership', () => {
    const table = read('src/features/supplier/components/SupplierTable.jsx');
    expect(table).not.toContain('react-router-dom');
    expect(table).toContain('onOpenSupplier');
  });

  it('preserves distinct edit and legacy update authorities', () => {
    const edit = read('src/features/supplier/workspace/SupplierEditWorkspace.jsx');
    const legacyUpdate = read('src/features/supplier/workspace/SupplierLegacyUpdateWorkspace.jsx');
    expect(edit).toContain('updateSupplierAction');
    expect(edit).toContain('deleteSupplierAction');
    expect(edit).toContain('navigate(paths.view(id))');
    expect(legacyUpdate).toContain('sanitizeLegacySupplierUpdatePayload');
    expect(legacyUpdate).toContain('updateSupplier(id,');
    expect(legacyUpdate).not.toContain('deleteSupplierAction');
  });
});
