import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (file) => fs.existsSync(path.join(root, file));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('Quick Receive feature residue retirement', () => {
  it('retires the final Quick Receive runtime component', () => {
    expect(exists('src/features/quickReceive/components/SupplierSearchSelect.jsx')).toBe(false);
  });

  it('leaves no runtime source under src/features/quickReceive', () => {
    expect(exists('src/features/quickReceive/api/quickReceiveApi.js')).toBe(false);
    expect(exists('src/features/quickReceive/api/quickReceiveProductApi.js')).toBe(false);
    expect(exists('src/features/quickReceive/store/quickReceiveStore.js')).toBe(false);
    expect(exists('src/features/quickReceive/pages/QuickReceivePage.jsx')).toBe(false);
    expect(exists('src/features/quickReceive/components/SupplierSearchSelect.jsx')).toBe(false);
  });

  it('preserves the quick-receive route through Quick Stock ownership', () => {
    const routes = read('src/routes/partner/purchasesRoutes.jsx');
    expect(routes).toContain("import QuickStockPage from '@/features/receiving/quick-stock/pages/QuickStockPage'");
    expect(routes).toContain("{ path: 'quick-receive', element: <QuickStockPage /> }");
  });
});
