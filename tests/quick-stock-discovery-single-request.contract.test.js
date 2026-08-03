import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '..');

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('quick stock discovery single request contract', () => {
  it('keeps product discovery under explicit user-event authority', () => {
    const controller = read('src/features/receiving/quick-stock/hooks/useQuickStockDiscoveryController.js');
    const page = read('src/features/receiving/quick-stock/pages/QuickStockPage.jsx');

    expect(controller).toContain('const executeProductSearch = useCallback');
    expect(controller).not.toMatch(/useEffect\(\(\) => \{\s*executeProductSearch\(/s);

    expect(page).toContain('onSearch={() => {');
    expect(page).toContain('onKeywordEnter={(value) => {');
    expect(page).toContain('executeProductSearch({ search: nextKeyword });');
    expect(page).toContain('executeProductSearch({ productTypeId: value, brandId: "", search: committedKeyword });');
    expect(page).toContain('executeProductSearch({ brandId: value, search: committedKeyword });');
  });
});
