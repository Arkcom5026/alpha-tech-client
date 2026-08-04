const assert = require('assert')
const fs = require('fs')
const path = require('path')

const read = (relativePath) =>
  fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')

const api = read('src/features/templateCandidate/api/templateCandidateApi.js')
const store = read('src/features/templateCandidate/store/templateCandidateStore.js')
const hook = read('src/features/templateCandidate/hooks/useTemplateCandidate.js')
const status = read('src/features/templateCandidate/utils/candidateStatus.js')
const mapper = read('src/features/templateCandidate/utils/candidateMapper.js')
const queuePage = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx')
const detailPage = read('src/features/templateCandidate/pages/CandidateDetailPage.jsx')
const routes = read('src/routes/superadmin/superAdminRoutes.jsx')

// Current backend authority only.
assert.match(api, /const BASE_PATH = 'product-templates\/candidates'/)
assert.match(api, /apiClient\.get\(BASE_PATH/)
assert.match(api, /apiClient\.get\(`\$\{BASE_PATH\}\/\$\{id\}`/)
assert.match(api, /apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/start-review`/)
assert.match(api, /apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/reject`/)
assert.match(api, /apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/merge`/)
assert.match(api, /apiClient\.post\(`\$\{BASE_PATH\}\/\$\{id\}\/promote`/)
assert.doesNotMatch(api, /request-revision|merge-existing|\/status/)

// Client state machine mirrors backend schema exactly.
for (const currentStatus of ['DRAFT', 'UNDER_REVIEW', 'REJECTED', 'MERGED', 'PROMOTED', 'CANCELLED']) {
  assert.match(status, new RegExp(`\\b${currentStatus}\\b`), `Missing status ${currentStatus}`)
}
assert.doesNotMatch(status, /SUBMITTED|REVISION_REQUESTED|APPROVED|MERGED_EXISTING/)

// Store and hook expose only current lifecycle commands and queue projections.
for (const action of ['startReview', 'rejectCandidate', 'mergeCandidate', 'promoteCandidate']) {
  assert.match(hook, new RegExp(`\\b${action}\\b`), `Missing hook action ${action}`)
}
assert.match(store, /summary:/)
assert.match(store, /reviewerWorkload:/)
assert.match(store, /pagination:/)
assert.match(store, /startReviewTemplateCandidateAction/)
assert.match(store, /rejectTemplateCandidateAction/)
assert.match(store, /mergeTemplateCandidateAction/)
assert.match(store, /promoteTemplateCandidateAction/)
assert.doesNotMatch(`${store}\n${hook}`, /requestRevision|submitCandidate/)

// Mapper is catalog-safe and preserves governance evidence.
assert.match(mapper, /sourceSnapshot/)
assert.match(mapper, /proposedTemplateData/)
assert.match(mapper, /events/)
assert.match(mapper, /reviewedByEmployee/)
assert.match(mapper, /createdByEmployee/)
assert.doesNotMatch(mapper, /costPrice|priceRetail|priceOnline|priceWholesale|branchPrice|productImages|images:/)

// Review Queue consumes summary, workload, filters, sorting and pagination.
assert.match(queuePage, /summary/)
assert.match(queuePage, /reviewerWorkload/)
assert.match(queuePage, /sortBy/)
assert.match(queuePage, /sortDirection/)
assert.match(queuePage, /reviewerId/)
assert.match(queuePage, /status/)
assert.match(queuePage, /pageSize/)
assert.match(queuePage, /navigate\([^)]*candidates/)
assert.doesNotMatch(queuePage, /SUBMITTED|REQUEST_REVISION|REVISION_REQUESTED|APPROVED|MERGED_EXISTING/)

// Detail workspace gates commands by real state and renders governance evidence.
assert.match(detailPage, /startReview\(/)
assert.match(detailPage, /rejectCandidate\(/)
assert.match(detailPage, /mergeCandidate\(/)
assert.match(detailPage, /promoteCandidate\(/)
assert.match(detailPage, /sourceSnapshot/)
assert.match(detailPage, /proposedTemplateData/)
assert.match(detailPage, /events/)
assert.match(detailPage, /decisionNote/)
assert.match(detailPage, /targetTemplateProductId/)
assert.match(detailPage, /productTypeId/)
assert.match(detailPage, /trackSerialNumber/)
assert.doesNotMatch(detailPage, /SUBMITTED|REQUEST_REVISION|REVISION_REQUESTED|APPROVED|MERGED_EXISTING/)
assert.doesNotMatch(detailPage, /costPrice|priceRetail|priceOnline|priceWholesale|stockItem|stockMovement|serialNumber\s*:|supplier|customer|sale|purchaseOrder|taxDocument|repairJob|warrantyClaim|reservation|productImage/)

// SUPERADMIN route surface remains explicit.
assert.match(routes, /path:\s*'candidates'/)
assert.match(routes, /CandidateReviewPage/)
assert.match(routes, /CandidateDetailPage/)
assert.match(routes, /path:\s*':id'/)

console.log('product-template-candidate-review-workspace-slice-5.contract.test.js: PASS')
