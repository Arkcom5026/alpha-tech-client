import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

const expectThinAdapter = (pagePath, workspaceName) => {
  const page = read(pagePath);
  expect(page).toContain(`import ${workspaceName} from '../workspaces/${workspaceName}'`);
  expect(page).toContain(`export default ${workspaceName}`);
};

describe('product template CRUD workspace behavior lock', () => {
  it('preserves tenant-aware on-demand list loading, URL state, and management policy', () => {
    const workspace = read('workspaces/ProductTemplateListWorkspace.jsx');
    expect(workspace).toContain('useSearchParams');
    expect(workspace).toContain('useParams');
    expect(workspace).toContain('hasLoaded');
    expect(workspace).toContain('fetchListAction({ page, limit, includeInactive })');
    expect(workspace).toContain("params.get('includeInactive') === 'true'");
    expect(workspace).toContain('canManageProductOrdering');
    expect(workspace).toContain('isSuperAdmin');
    expect(workspace).toContain('setLimitAction');
    expect(workspace).toContain('setIncludeInactiveAction');
    expect(workspace).toContain('ProductTemplateTable');
    expect(workspace).toContain('`/${shopSlug}/pos/stock/templates/create`');
    expect(workspace).toContain('`/${shopSlug}/pos/stock/templates/edit/${row.id}`');
    expectThinAdapter('pages/ListProductTemplatePage.jsx', 'ProductTemplateListWorkspace');
  });

  it('preserves create authority, branch-context validation, payload normalization, and tenant return path', () => {
    const workspace = read('workspaces/ProductTemplateCreateWorkspace.jsx');
    expect(workspace).toContain('canManageProductOrdering');
    expect(workspace).toContain('selectedBranchId');
    expect(workspace).toContain('if (!selectedBranchId)');
    expect(workspace).toContain('addTemplateAction');
    expect(workspace).toContain('name: (safeForm.name || \'\').trim()');
    expect(workspace).toContain('productProfileId: productProfileIdParsed');
    expect(workspace).toContain('unitId: unitIdParsed');
    expect(workspace).toContain('noSN: !!safeForm.noSN');
    expect(workspace).toContain('navigate(`/${shopSlug}/pos/stock/templates`)');
    expect(workspace).not.toContain('branchId: branchIdParsed');
    expectThinAdapter('pages/CreateProductTemplatePage.jsx', 'ProductTemplateCreateWorkspace');
  });

  it('preserves edit loading, management guard, branch context, update lifecycle, and tenant return path', () => {
    const workspace = read('workspaces/ProductTemplateEditWorkspace.jsx');
    expect(workspace).toContain('canManageProductOrdering');
    expect(workspace).toContain('selectedBranchId');
    expect(workspace).toContain('getTemplateByIdAction');
    expect(workspace).toContain('updateTemplateAction');
    expect(workspace).toContain('getTemplateById(id)');
    expect(workspace).toContain('await updateTemplate(id, formData)');
    expect(workspace).toContain('unitId: data?.unitId ? String(data.unitId)');
    expect(workspace).toContain('productProfileId: data?.productProfileId ? String(data.productProfileId)');
    expect(workspace).toContain('navigate(`/${shopSlug}/pos/stock/templates`)');
    expect(workspace).toContain('<ProductTemplateForm');
    expectThinAdapter('pages/EditProductTemplatePage.jsx', 'ProductTemplateEditWorkspace');
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
