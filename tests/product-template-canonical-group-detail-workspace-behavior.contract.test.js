import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('product template canonical group detail workspace behavior contract', () => {
  const page = read('src/features/templateCandidate/pages/CanonicalGroupDetailPage.jsx');
  const materialization = read('src/features/templateCandidate/workspace/components/CanonicalGroupMaterializationPanel.jsx');

  it('keeps canonical group fetch scoped by group key and business type', () => {
    expect(page).toContain("const { groupKey } = useParams();");
    expect(page).toContain("const businessType = searchParams.get('businessType') || '';");
    expect(page).toContain('getCanonicalProductGroupApi(groupKey, { businessType })');
    expect(page).toContain('[groupKey, businessType]');
  });

  it('preserves fail-safe fetch lifecycle and latest-request cleanup', () => {
    expect(page).toContain('let active = true;');
    expect(page).toContain('if (!active) return;');
    expect(page).toContain('setLoading(true);');
    expect(page).toContain('setError(null);');
    expect(page).toContain('active = false;');
  });

  it('materializes only READY groups through the existing catalog authority', () => {
    expect(page).toContain("const canMaterialize = group.reviewStatus === 'READY';");
    expect(page).toContain('materializeCanonicalProductGroupsApi({');
    expect(page).toContain('businessType,');
    expect(page).toContain('apply: true,');
    expect(page).toContain('limit: 500,');
    expect(page).toContain('groupKey,');
    expect(page).toContain('onMaterialize={materializeGroup}');
    expect(materialization).toContain('disabled={!canMaterialize || materializing}');
  });

  it('keeps result lifecycle and catalog-safe scope explicit', () => {
    expect(page).toContain('setMaterializeError(null);');
    expect(page).toContain('setMaterializeResult(null);');
    expect(page).toContain('setMaterializeResult(response?.data || response);');
    expect(page).toContain('setMaterializeError(requestError);');
    expect(materialization).toContain('โดยไม่แก้สินค้า ราคา หรือสต๊อก');
    expect(`${page}\n${materialization}`).not.toMatch(/costPrice|priceRetail|priceOnline|priceWholesale|stockMovement|purchaseOrder|taxDocument|repairJob|warrantyClaim/);
  });
});
