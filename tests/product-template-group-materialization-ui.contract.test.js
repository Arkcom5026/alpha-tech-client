import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('product template grouped materialization UI contract', () => {
  it('connects READY canonical groups to audited candidate materialization', () => {
    const apiSource = read('src/features/templateCandidate/api/templateCandidateApi.js');
    const pageSource = read('src/features/templateCandidate/pages/CanonicalGroupDetailPage.jsx');
    const panelSource = read('src/features/templateCandidate/workspace/components/CanonicalGroupMaterializationPanel.jsx');

    expect(apiSource).toContain('materializeCanonicalProductGroupsApi');
    expect(apiSource).toContain("${BASE_PATH}/discovery-materialize");
    expect(pageSource).toContain('apply: true');
    expect(pageSource).toContain('groupKey');
    expect(pageSource).toContain("group.reviewStatus === 'READY'");
    expect(pageSource).toContain('<CanonicalGroupMaterializationPanel');
    expect(panelSource).toContain('สร้าง Candidates จากกลุ่มนี้');
    expect(panelSource).toContain('materializeResult.created?.length');
    expect(panelSource).toContain('materializeResult.skipped?.length');
    expect(panelSource).toContain('materializeResult.failed?.length');
    expect(pageSource).not.toContain('promoteTemplateCandidateApi');
    expect(pageSource).not.toContain('mergeTemplateCandidateApi');
  });
});
