import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('product template CRUD workspace behavior lock', () => {
  it('preserves tenant-aware on-demand list loading, URL state, and management policy', () => {
    const page = read('pages/ListProductTemplatePage.jsx');
    expect(page).toContain('useSearchParams');
    expect(page).toContain('useParams');
    expect(page).toContain('hasLoaded');
    expect(page).toContain('fetchListAction({ page, limit, includeInactive })');
    expect(page).toContain("params.get('includeInactive') === 'true'");
    expect(page).toContain('canManageProductOrdering');
    expect(page).toContain('isSuperAdmin');
    expect(page).toContain('setLimitAction');
    expect(page).toContain('setIncludeInactiveAction');
    expect(page).toContain('ProductTemplateTable');
    expect(page).toContain('`/${shopSlug}/pos/stock/templates/create`');
    expect(page).toContain('`/${shopSlug}/pos/stock/templates/edit/${row.id}`');
  });

  it('preserves create authority, branch-context validation, payload normalization, and tenant return path', () => {
    const page = read('pages/CreateProductTemplatePage.jsx');
    expect(page).toContain('canManageProductOrdering');
    expect(page).toContain('selectedBranchId');
    expect(page).toContain('if (!selectedBranchId)');
    expect(page).toContain('addTemplateAction');
    expect(page).toContain('name: (safeForm.name || \'\').trim()');
    expect(page).toContain('productProfileId: productProfileIdParsed');
    expect(page).toContain('unitId: unitIdParsed');
    expect(page).toContain('noSN: !!safeForm.noSN');
    expect(page).toContain('navigate(`/${shopSlug}/pos/stock/templates`)');
    expect(page).not.toContain('branchId: branchIdParsed');
  });

  it('preserves edit loading, management guard, branch context, update lifecycle, and tenant return path', () => {
    const page = read('pages/EditProductTemplatePage.jsx');
    expect(page).toContain('canManageProductOrdering');
    expect(page).toContain('selectedBranchId');
    expect(page).toContain('getTemplateByIdAction');
    expect(page).toContain('updateTemplateAction');
    expect(page).toContain('getTemplateById(id)');
    expect(page).toContain('await updateTemplate(id, formData)');
    expect(page).toContain('unitId: data?.unitId ? String(data.unitId)');
    expect(page).toContain('productProfileId: data?.productProfileId ? String(data.productProfileId)');
    expect(page).toContain('navigate(`/${shopSlug}/pos/stock/templates`)');
    expect(page).toContain('<ProductTemplateForm');
  });

  it('preserves ProductTemplate store as CRUD lifecycle authority', () => {
    const store = read('store/productTemplateStore.js');
    expect(store).toContain('fetchListAction');
    expect(store).toContain('addTemplateAction');
    expect(store).toContain('getTemplateByIdAction');
    expect(store).toContain('updateTemplateAction');
    expect(store).toContain('toggleActiveAction');
  });
});
