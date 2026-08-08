import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

describe('quick receive legacy UI retirement contract', () => {
  it('keeps the runtime quick-receive route owned by QuickStockPage', () => {
    const routes = read('src/routes/partner/purchasesRoutes.jsx');

    expect(routes).toContain("import QuickStockPage from '@/features/receiving/quick-stock/pages/QuickStockPage'");
    expect(routes).toContain("{ path: 'quick-receive', element: <QuickStockPage /> }");
    expect(routes).not.toContain('QuickReceivePage');
  });

  it('retires the complete legacy Quick Receive scaffold UI', () => {
    for (const file of [
      'src/features/quickReceive/pages/QuickReceivePage.jsx',
      'src/features/quickReceive/components/QuickReceiveSimpleForm.jsx',
      'src/features/quickReceive/components/ProductSearchSimpleTable.jsx',
      'src/features/quickReceive/components/QuickReceiveSimpleTable.jsx',
      'src/features/quickReceive/components/SupplierSearchSelect.jsx',
    ]) {
      expect(exists(file), `${file} must be retired`).toBe(false);
    }
  });

  it('retires all legacy Quick Receive runtime boundaries', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveApi.js')).toBe(false);
    expect(exists('src/features/quickReceive/api/quickReceiveProductApi.js')).toBe(false);
    expect(exists('src/features/quickReceive/store/quickReceiveStore.js')).toBe(false);
    expect(exists('src/features/quickReceive/components/SupplierSearchSelect.jsx')).toBe(false);
  });
});
