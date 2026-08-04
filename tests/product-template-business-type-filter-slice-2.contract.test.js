import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('product template business-type filter slice 2 contract', () => {
  it('requires a business-type scope before loading or reviewing candidates', () => {
    const page = read('src/features/templateCandidate/pages/CandidateReviewPage.jsx');
    const mapper = read('src/features/templateCandidate/utils/candidateMapper.js');
    const businessType = read('src/features/templateCandidate/utils/businessType.js');
    const api = read('src/features/templateCandidate/api/templateCandidateApi.js');

    for (const value of ['GENERAL', 'IT', 'ELECTRONICS', 'CONSTRUCTION', 'GROCERY']) {
      expect(businessType).toContain(`value: '${value}'`);
    }

    expect(page).toMatch(/businessType:\s*''/);
    expect(page).toMatch(/if \(!next\?\.businessType\) return Promise\.resolve\(null\)/);
    expect(page).not.toMatch(/React\.useEffect\([\s\S]*loadQueue/);
    expect(page).toContain('BUSINESS_TYPE_OPTIONS.map');
    expect(page).toContain('handleBusinessType');
    expect(page).toContain('Queue จะยังไม่โหลดจนกว่าจะเลือกประเภทธุรกิจ');
    expect(page).toContain('getBusinessTypeLabel(candidate.businessType)');
    expect(page).toContain('...filters, status, page: 1');
    expect(page).toContain('...filters, reviewerId: String(item.reviewerId), page: 1');
    expect(page).toContain('...filters, page');

    expect(mapper).toMatch(/businessType:\s*candidate\.sourceBranch\?\.businessType/);
    expect(api).toMatch(/apiClient\.get\(BASE_PATH, \{ params: cleanParams\(params\) \}\)/);

    expect(page).not.toMatch(/costPrice|priceRetail|serialNumber|supplier|stockMovement/i);
  });
});
