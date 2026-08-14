import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const api = read('src/features/templateCandidate/api/templateCandidateApi.js');
const status = read('src/features/templateCandidate/utils/candidateStatus.js');
const mapper = read('src/features/templateCandidate/utils/candidateMapper.js');
const review = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');
const detail = read('src/features/templateCandidate/pages/CandidateDetailPage.jsx');
const snapshots = read('src/features/templateCandidate/workspace/components/CandidateDetailSnapshots.jsx');
const scanner = read('src/features/templateCandidate/workspace/components/CandidateCatalogQualityScanner.jsx');
const decision = read('src/features/templateCandidate/workspace/components/CandidateCatalogQualityDecisionPanel.jsx');
const queue = read('src/features/templateCandidate/workspace/components/CandidateReviewQueue.jsx');
const header = read('src/features/templateCandidate/workspace/components/CandidateReviewWorkspaceHeader.jsx');

assert.match(api, /quality\/scan/);
assert.match(api, /quality\/scan-orphans/);
assert.match(api, /quality\/scan-quality/);
assert.match(api, /resolve-duplicate/);
assert.match(api, /archive-orphan/);

assert.match(status, /POSSIBLE_DUPLICATE/);
assert.match(status, /QUALITY_REVIEW/);
assert.match(status, /ORPHAN_UNUSED/);
assert.match(status, /OPEN/);
assert.match(status, /RESOLVED/);
assert.match(status, /ARCHIVED/);

assert.match(mapper, /templateBranchId/);
assert.match(mapper, /primaryTemplateProductId/);
assert.match(mapper, /comparisonTemplateProductId/);
assert.match(mapper, /assessment/);
assert.match(mapper, /resolution/);

assert.match(review, /CandidateCatalogQualityScanner/);
assert.match(review, /scanDuplicates/);
assert.match(review, /scanOrphans/);
assert.match(review, /scanQuality/);
assert.match(scanner, /Template Branch ID/);
assert.match(scanner, /Dry run/);
assert.match(scanner, /สร้าง Candidate/);
assert.match(scanner, /apply/);
assert.match(header, /Template Catalog Quality/);

assert.match(detail, /CandidateCatalogQualityDecisionPanel/);
assert.match(detail, /catalogQualityCandidate/);
assert.match(detail, /canonicalTemplateProductId/);
assert.match(detail, /resolveDuplicate/);
assert.match(detail, /archiveOrphan/);

assert.match(snapshots, /Catalog Assessment/);
assert.match(snapshots, /Resolution/);
assert.match(decision, /Template Catalog Quality/);
assert.match(decision, /Canonical/);
assert.match(decision, /นำออกจาก Catalog/);
assert.match(queue, /candidate\.type/);
assert.match(queue, /primaryTemplateProductId/);

assert.ok(!decision.includes('Promote New Template'));
assert.ok(!decision.includes('Merge Existing'));
assert.ok(!decision.includes('สร้าง Template ใหม่'));

console.log('product-template-catalog-quality-candidate-ui.contract.test.js: PASS');
