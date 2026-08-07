import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('product template candidate review workspace split contract', () => {
  const page = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');
  const header = read('src/features/templateCandidate/workspace/components/CandidateReviewWorkspaceHeader.jsx');
  const scope = read('src/features/templateCandidate/workspace/components/CandidateBusinessTypeScope.jsx');
  const summary = read('src/features/templateCandidate/workspace/components/CandidateReviewSummary.jsx');
  const filters = read('src/features/templateCandidate/workspace/components/CandidateReviewFilters.jsx');
  const queue = read('src/features/templateCandidate/workspace/components/CandidateReviewQueue.jsx');

  it('composes the candidate review workspace from presentation slices', () => {
    for (const component of [
      'CandidateReviewWorkspaceHeader',
      'CandidateBusinessTypeScope',
      'CandidateReviewSummary',
      'CandidateReviewFilters',
      'CandidateReviewQueue',
    ]) {
      expect(page).toContain(component);
    }
  });

  it('keeps queue governance and filter authority in the page', () => {
    expect(page).toContain('if (!next?.businessType) return Promise.resolve(null);');
    expect(page).toContain('return refresh(next);');
    expect(page).toContain('const applyFilters = (next) =>');
    expect(page).toContain('const updateFilter = (key, value) =>');
    expect(page).toContain('const handleBusinessType = (businessType) =>');
    expect(page).toContain('const handleOpenCandidate = (candidateId) => navigate(`${detailBasePath}/${candidateId}`);');
  });

  it('keeps operational controls accessible in presentation owners', () => {
    expect(header).toContain('min-h-11');
    expect(scope).toContain('min-h-11');
    expect(filters).toContain('type="search"');
    expect(filters).toContain('min-h-11');
    expect(queue).toContain('min-h-11');
  });

  it('keeps presentation slices free of data fetching and catalog mutations', () => {
    const presentation = [header, scope, summary, filters, queue].join('\n');
    expect(presentation).not.toContain('refresh(');
    expect(presentation).not.toContain('useTemplateCandidate');
    expect(presentation).not.toMatch(/startReview|rejectCandidate|mergeCandidate|promoteCandidate/);
  });
});
