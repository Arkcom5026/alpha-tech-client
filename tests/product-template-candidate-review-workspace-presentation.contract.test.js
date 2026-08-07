import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('product template candidate review workspace presentation contract', () => {
  const page = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');
  const filters = read('src/features/templateCandidate/workspace/components/CandidateReviewFilters.jsx');
  const queue = read('src/features/templateCandidate/workspace/components/CandidateReviewQueue.jsx');

  it('keeps queue business behavior owned by the page before presentation extraction', () => {
    expect(page).toContain('if (!next?.businessType) return Promise.resolve(null);');
    expect(page).toContain('return refresh(next);');
    expect(page).toContain('handleBusinessType');
    expect(page).toContain('handleSearch');
    expect(page).toContain('handlePage');
    expect(page).toContain('reviewerWorkload');
  });

  it('preserves candidate navigation and filter authority', () => {
    expect(page).toContain('const detailBasePath');
    expect(page).toContain('const handleOpenCandidate = (candidateId) => navigate(`${detailBasePath}/${candidateId}`);');
    expect(page).toContain('onOpenCandidate={handleOpenCandidate}');
    expect(queue).toContain('onClick={() => onOpenCandidate(candidate.id)}');
    expect(queue).not.toContain('useNavigate');
    expect(queue).not.toContain('navigate(');
    for (const field of ['businessType', 'q', 'status', 'reviewerId', 'sortBy', 'sortDirection', 'page', 'pageSize']) {
      expect(page).toContain(field);
    }
  });

  it('keeps the catalog queue operationally accessible through presentation owners', () => {
    expect(filters).toContain('type="search"');
    expect(filters).toContain('min-h-11');
    expect(queue).toContain('min-h-11');
    expect(page).toContain('role="alert"');
  });

  it('keeps candidate queue separate from canonical-group review', () => {
    expect(page).not.toContain('useCanonicalProductGroups');
    expect(page).not.toContain('Canonical Product Group Review');
    expect(queue).not.toContain('useCanonicalProductGroups');
  });
});
