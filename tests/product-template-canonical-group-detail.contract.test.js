import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('product template canonical group detail contract', () => {
  it('links the read-only group workspace to the canonical group detail projection', () => {
    const api = read('src/features/templateCandidate/api/templateCandidateApi.js');
    const listPage = read('src/features/templateCandidate/pages/CanonicalGroupReviewPage.jsx');
    const candidatePage = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');
    const candidateHeader = read('src/features/templateCandidate/workspace/components/CandidateReviewWorkspaceHeader.jsx');
    const detailPage = read('src/features/templateCandidate/pages/CanonicalGroupDetailPage.jsx');
    const detailHeader = read('src/features/templateCandidate/workspace/components/CanonicalGroupDetailHeader.jsx');
    const sourceProducts = read('src/features/templateCandidate/workspace/components/CanonicalGroupSourceProducts.jsx');
    const routes = read('src/routes/superadmin/superAdminRoutes.jsx');

    expect(api).toContain('getCanonicalProductGroupApi');
    expect(api).toContain('encodeURIComponent(groupKey)');
    expect(listPage).toContain('useCanonicalProductGroups');
    expect(listPage).toContain('openGroup');
    expect(listPage).toContain("const basePath = shopSlug");
    expect(listPage).toContain("catalog/candidates/groups");
    expect(listPage).toContain('encodeURIComponent(groupKey)');
    expect(listPage).toContain('businessType=${encodeURIComponent(filters.businessType)}');
    expect(candidatePage).toContain('CandidateReviewWorkspaceHeader');
    expect(candidateHeader).toContain('Product Template Candidate Workspace');
    expect(candidateHeader).toContain('Template Catalog Quality');
    expect(detailPage).toContain('CanonicalGroupDetailHeader');
    expect(detailPage).toContain('CanonicalGroupSourceProducts');
    expect(detailHeader).toContain('Canonical Group Detail');
    expect(detailHeader).toContain('แบบอ่านอย่างเดียว');
    expect(sourceProducts).toContain('Source Products');
    expect(routes).toContain("path: 'groups'");
    expect(routes).toContain('CanonicalGroupReviewPage');
    expect(routes).toContain("path: 'groups/:groupKey'");
    expect(routes).toContain('CanonicalGroupDetailPage');
    expect(detailPage).not.toContain('promoteTemplateCandidateApi');
    expect(detailPage).not.toContain('mergeTemplateCandidateApi');
  });
});
