import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('product template canonical group detail workspace cutover contract', () => {
  const page = read('src/features/templateCandidate/pages/CanonicalGroupDetailPage.jsx');
  const materialization = read('src/features/templateCandidate/workspace/components/CanonicalGroupMaterializationPanel.jsx');

  it('composes canonical group detail from presentation slices', () => {
    for (const component of [
      'CanonicalGroupDetailHeader',
      'CanonicalGroupDetailSummary',
      'CanonicalGroupMaterializationPanel',
      'CanonicalGroupReviewReasons',
      'CanonicalGroupSourceProducts',
    ]) {
      expect(page).toContain(component);
    }
  });

  it('keeps fetch and materialization authority in the page', () => {
    expect(page).toContain('getCanonicalProductGroupApi(groupKey, { businessType })');
    expect(page).toContain('materializeCanonicalProductGroupsApi({');
    expect(page).toContain('const canMaterialize = group.reviewStatus === \'READY\';');
    expect(page).toContain('onMaterialize={materializeGroup}');
  });

  it('keeps presentation free of catalog data authority', () => {
    expect(materialization).not.toContain('materializeCanonicalProductGroupsApi');
    expect(materialization).not.toContain('getCanonicalProductGroupApi');
    expect(materialization).not.toContain('useSearchParams');
  });

  it('keeps READY validation and operational feedback presentation-owned', () => {
    expect(materialization).toContain('disabled={!canMaterialize || materializing}');
    expect(materialization).toContain('role="alert"');
    expect(materialization).toContain('CREATED');
    expect(materialization).toContain('SKIPPED');
    expect(materialization).toContain('FAILED');
  });
});
