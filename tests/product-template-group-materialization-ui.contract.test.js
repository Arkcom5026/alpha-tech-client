import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('product template grouped materialization UI contract', () => {
  it('connects READY canonical groups to audited candidate materialization', () => {
    const apiSource = read('src/features/templateCandidate/api/templateCandidateApi.js');
    const pageSource = read('src/features/templateCandidate/pages/CanonicalGroupDetailPage.jsx');

    expect(apiSource).toContain('materializeCanonicalProductGroupsApi');
    expect(apiSource).toContain("${BASE_PATH}/discovery-materialize");
    expect(pageSource).toContain('apply: true');
    expect(pageSource).toContain('groupKey');
    expect(pageSource).toContain("group.reviewStatus === 'READY'");
    expect(pageSource).toContain('สร้าง Candidates จากกลุ่มนี้');
    expect(pageSource).toContain('materializeResult.created?.length');
    expect(pageSource).toContain('materializeResult.skipped?.length');
    expect(pageSource).toContain('materializeResult.failed?.length');
    expect(pageSource).not.toContain('promoteTemplateCandidateApi');
    expect(pageSource).not.toContain('mergeTemplateCandidateApi');
  });
});
