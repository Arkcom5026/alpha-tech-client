import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('product template candidate detail workspace presentation contract', () => {
  const header = read('src/features/templateCandidate/workspace/components/CandidateDetailHeader.jsx');
  const snapshots = read('src/features/templateCandidate/workspace/components/CandidateDetailSnapshots.jsx');
  const startReview = read('src/features/templateCandidate/workspace/components/CandidateDetailStartReview.jsx');
  const decision = read('src/features/templateCandidate/workspace/components/CandidateDetailDecisionPanel.jsx');
  const timeline = read('src/features/templateCandidate/workspace/components/CandidateDetailTimeline.jsx');
  const presentation = [header, snapshots, startReview, decision, timeline].join('\n');

  it('keeps extracted detail components presentation-only', () => {
    expect(presentation).not.toContain('useTemplateCandidate');
    expect(presentation).not.toContain('fetchById');
    expect(presentation).not.toContain('promoteCandidate(');
    expect(presentation).not.toContain('mergeCandidate(');
    expect(presentation).not.toContain('rejectCandidate(');
  });

  it('preserves operational controls and governance surfaces', () => {
    expect(header).toContain('min-h-11');
    expect(startReview).toContain('Start Review');
    expect(decision).toContain('Decision Note');
    expect(decision).toContain('Target Template Product ID');
    expect(decision).toContain('Product Config JSON');
    expect(decision).toContain('Track Serial');
  });

  it('preserves the complete promote-form presentation surface', () => {
    for (const field of ['name', 'productTypeId', 'brandId', 'unitId', 'mode', 'active', 'noSN', 'trackSerialNumber', 'codeType', 'warrantyDays', 'productConfig']) {
      expect(decision).toContain(`promoteForm.${field}`);
    }
  });

  it('keeps snapshots and governance history readable', () => {
    expect(snapshots).toContain('Source Snapshot');
    expect(snapshots).toContain('Proposed Template Data');
    expect(timeline).toContain('Event Timeline');
    expect(timeline).toContain('previousStatus');
    expect(timeline).toContain('resultingStatus');
  });
});
