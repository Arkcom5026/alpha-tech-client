import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('product template candidate review workspace slice 5 contract', () => {
  it('aligns the frontend workspace with current backend governance authority', () => {
    const api = read('src/features/templateCandidate/api/templateCandidateApi.js');
    const store = read('src/features/templateCandidate/store/templateCandidateStore.js');
    const hook = read('src/features/templateCandidate/hooks/useTemplateCandidate.js');
    const status = read('src/features/templateCandidate/utils/candidateStatus.js');
    const mapper = read('src/features/templateCandidate/utils/candidateMapper.js');
    const queuePage = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');
    const queuePresentation = read('src/features/templateCandidate/workspace/components/CandidateReviewQueue.jsx');
    const detailPage = read('src/features/templateCandidate/pages/CandidateDetailPage.jsx');
    const routes = read('src/routes/superadmin/superAdminRoutes.jsx');

    expect(api).toMatch(/const BASE_PATH = 'product-templates\/candidates'/);
    expect(api).toMatch(/apiClient\.get\(BASE_PATH/);
    expect(api).toMatch(/apiClient\.get\(`\$\{BASE_PATH\}\/\$\{id\}`/);
    expect(api).toMatch(/apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/start-review`/);
    expect(api).toMatch(/apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/reject`/);
    expect(api).toMatch(/apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/merge`/);
    expect(api).toMatch(/apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/promote`/);
    expect(api).not.toMatch(/request-revision|merge-existing|\/status/);

    for (const currentStatus of ['DRAFT', 'UNDER_REVIEW', 'REJECTED', 'MERGED', 'PROMOTED', 'CANCELLED']) {
      expect(status).toMatch(new RegExp(`\\b${currentStatus}\\b`));
    }
    expect(status).not.toMatch(/SUBMITTED|REVISION_REQUESTED|APPROVED|MERGED_EXISTING/);

    for (const action of ['startReview', 'rejectCandidate', 'mergeCandidate', 'promoteCandidate']) {
      expect(hook).toMatch(new RegExp(`\\b${action}\\b`));
    }
    expect(store).toMatch(/summary:/);
    expect(store).toMatch(/reviewerWorkload:/);
    expect(store).toMatch(/pagination:/);
    expect(store).toMatch(/startTemplateCandidateReviewAction/);
    expect(store).toMatch(/rejectTemplateCandidateAction/);
    expect(store).toMatch(/mergeTemplateCandidateAction/);
    expect(store).toMatch(/promoteTemplateCandidateAction/);
    expect(`${store}\n${hook}`).not.toMatch(/requestRevision|submitCandidate/);

    expect(mapper).toMatch(/sourceSnapshot/);
    expect(mapper).toMatch(/proposedTemplateData/);
    expect(mapper).toMatch(/events/);
    expect(mapper).toMatch(/reviewedByEmployee/);
    expect(mapper).toMatch(/createdByEmployee/);
    expect(mapper).not.toMatch(/costPrice|priceRetail|priceOnline|priceWholesale|branchPrice|productImages|images:/);

    expect(queuePage).toMatch(/summary/);
    expect(queuePage).toMatch(/reviewerWorkload/);
    expect(queuePage).toMatch(/sortBy/);
    expect(queuePage).toMatch(/sortDirection/);
    expect(queuePage).toMatch(/reviewerId/);
    expect(queuePage).toMatch(/status/);
    expect(queuePage).toMatch(/pageSize/);
    expect(queuePage).toMatch(/const detailBasePath/);
    expect(queuePage).toMatch(/\/superadmin\/catalog\/candidates/);
    expect(queuePage).toMatch(/const handleOpenCandidate = \(candidateId\) => navigate\(`\$\{detailBasePath\}\/\$\{candidateId\}`\);/);
    expect(queuePage).toMatch(/onOpenCandidate=\{handleOpenCandidate\}/);
    expect(queuePresentation).toMatch(/onClick=\{\(\) => onOpenCandidate\(candidate\.id\)\}/);
    expect(queuePresentation).not.toMatch(/useNavigate|navigate\(/);
    expect(queuePage).not.toMatch(/SUBMITTED|REQUEST_REVISION|REVISION_REQUESTED|APPROVED|MERGED_EXISTING/);

    expect(detailPage).toMatch(/startReview\(/);
    expect(detailPage).toMatch(/rejectCandidate\(/);
    expect(detailPage).toMatch(/mergeCandidate\(/);
    expect(detailPage).toMatch(/promoteCandidate\(/);
    expect(detailPage).toMatch(/sourceSnapshot/);
    expect(detailPage).toMatch(/proposedTemplateData/);
    expect(detailPage).toMatch(/events/);
    expect(detailPage).toMatch(/decisionNote/);
    expect(detailPage).toMatch(/targetTemplateProductId/);
    expect(detailPage).toMatch(/productTypeId/);
    expect(detailPage).toMatch(/trackSerialNumber/);
    expect(detailPage).not.toMatch(/SUBMITTED|REQUEST_REVISION|REVISION_REQUESTED|APPROVED|MERGED_EXISTING/);
    expect(detailPage).not.toMatch(/costPrice|priceRetail|priceOnline|priceWholesale|stockItem|stockMovement|serialNumber\s*:|supplier|customer|sale|purchaseOrder|taxDocument|repairJob|warrantyClaim|reservation|productImage/);

    expect(routes).toMatch(/path:\s*'candidates'/);
    expect(routes).toMatch(/CandidateReviewPage/);
    expect(routes).toMatch(/CandidateDetailPage/);
    expect(routes).toMatch(/path:\s*':id'/);
  });
});
