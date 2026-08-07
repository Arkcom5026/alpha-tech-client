import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/templateCandidate/pages/CandidateDetailPage.jsx');
const components = [
  'CandidateDetailHeader.jsx',
  'CandidateDetailSnapshots.jsx',
  'CandidateDetailStartReview.jsx',
  'CandidateDetailDecisionPanel.jsx',
  'CandidateDetailTimeline.jsx',
].map((name) => read(`src/features/templateCandidate/workspace/components/${name}`)).join('\n');

describe('product template candidate detail workspace cutover contract', () => {
  it('composes the detail workspace from presentation slices', () => {
    for (const name of ['CandidateDetailHeader', 'CandidateDetailSnapshots', 'CandidateDetailStartReview', 'CandidateDetailDecisionPanel', 'CandidateDetailTimeline']) {
      expect(page).toContain(name);
    }
  });

  it('keeps governance data and mutation authority in the page', () => {
    for (const token of ['useTemplateCandidate', 'fetchById', 'startReview', 'rejectCandidate', 'mergeCandidate', 'promoteCandidate', 'runAction', 'handlePromote']) {
      expect(page).toContain(token);
    }
    expect(page).toContain('JSON.parse(promoteForm.productConfig)');
    expect(page).toContain('await refresh();');
  });

  it('keeps status gates and action intents page-owned', () => {
    expect(page).toContain('status === TEMPLATE_CANDIDATE_STATUS.DRAFT');
    expect(page).toContain('status === TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW');
    expect(page).toContain('onReject={() => runAction(() => rejectCandidate');
    expect(page).toContain('onMerge={() => runAction(() => mergeCandidate');
    expect(page).toContain('onPromote={handlePromote}');
  });

  it('keeps extracted presentation slices free of governance data access', () => {
    expect(components).not.toContain('useTemplateCandidate');
    expect(components).not.toContain('fetchById');
    expect(components).not.toContain('promoteCandidate(');
    expect(components).not.toContain('mergeCandidate(');
    expect(components).not.toContain('rejectCandidate(');
  });
});
