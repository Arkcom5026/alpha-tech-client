const fs = require('fs');
const path = require('path');

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

const api = read('src/features/templateCandidate/api/templateCandidateApi.js');
const hook = read('src/features/templateCandidate/hooks/useCanonicalProductGroups.js');
const page = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');

const assertions = [
  [api.includes('listCanonicalProductGroupsApi'), 'canonical group API export'],
  [api.includes('`${BASE_PATH}/groups`'), 'canonical groups endpoint'],
  [hook.includes('useCanonicalProductGroups'), 'canonical group hook'],
  [hook.includes('payload.items'), 'group projection adoption'],
  [page.includes('Canonical Product Group Review'), 'group review workspace title'],
  [page.includes('PRODUCT_TYPE_REVIEW_REQUIRED'), 'product type review status'],
  [page.includes('sourceProductCount'), 'source product coverage'],
  [page.includes('sourceBranchCount'), 'source branch coverage'],
  [page.includes('แบบอ่านอย่างเดียว'), 'read-only safety notice'],
  [!page.includes('promoteCandidate'), 'no promotion action'],
  [!page.includes('mergeCandidate'), 'no merge action'],
];

for (const [passed, label] of assertions) {
  if (!passed) throw new Error(`Contract failed: ${label}`);
}

console.log('product-template-canonical-group-review-workspace-pt-gr-01.contract.test.js: PASS');
