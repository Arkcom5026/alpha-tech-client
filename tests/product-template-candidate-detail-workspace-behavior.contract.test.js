import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('product template candidate detail workspace behavior contract', () => {
  const page = read('src/features/templateCandidate/pages/CandidateDetailPage.jsx');
  const decisionPanel = read(
    'src/features/templateCandidate/workspace/components/CandidateDetailDecisionPanel.jsx',
  );

  it('keeps candidate fetch and action refresh lifecycle owned by the detail page', () => {
    expect(page).toContain('if (id) fetchById(id);');
    expect(page).toContain('const refresh = React.useCallback(async () =>');
    expect(page).toContain('await action();');
    expect(page).toContain('await refresh();');
    expect(page).toContain('clearError();');
  });

  it('preserves governance actions and status gates while UI validation stays presentation-owned', () => {
    for (const action of ['startReview', 'rejectCandidate', 'mergeCandidate', 'promoteCandidate']) {
      expect(page).toContain(action);
    }
    expect(page).toContain('TEMPLATE_CANDIDATE_STATUS.DRAFT');
    expect(page).toContain('TEMPLATE_CANDIDATE_STATUS.UNDER_REVIEW');
    expect(page).toContain('decisionNote={decisionNote}');
    expect(page).toContain('targetTemplateProductId={targetTemplateProductId}');
    expect(page).toContain('onReject={() => runAction(() => rejectCandidate');
    expect(page).toContain('onMerge={() => runAction(() => mergeCandidate');
    expect(decisionPanel).toContain('disabled={busy || !decisionNote.trim()}');
    expect(decisionPanel).toContain('disabled={busy || !targetTemplateProductId}');
  });

  it('preserves promote form hydration and catalog-safe payload semantics', () => {
    for (const field of [
      'name',
      'productTypeId',
      'brandId',
      'unitId',
      'mode',
      'active',
      'noSN',
      'trackSerialNumber',
      'codeType',
      'warrantyDays',
      'productConfig',
    ]) {
      expect(page).toContain(field);
    }
    expect(page).toContain('candidate.proposedTemplateData || candidate.sourceSnapshot || {}');
    expect(page).toContain("JSON.parse(promoteForm.productConfig)");
    expect(page).toContain("throw new Error('Product Config ต้องเป็น JSON ที่ถูกต้อง')");
    expect(page).toContain('decisionNote: decisionNote.trim() || null');
  });

  it('keeps the detail surface catalog-governance scoped', () => {
    expect(page).toContain('sourceSnapshot');
    expect(page).toContain('proposedTemplateData');
    expect(page).toContain('events');
    expect(page).not.toMatch(/costPrice|priceRetail|priceOnline|priceWholesale|stockMovement|purchaseOrder|taxDocument|repairJob|warrantyClaim/);
    expect(decisionPanel).not.toMatch(/useTemplateCandidate|fetchById|startReview|rejectCandidate|mergeCandidate|promoteCandidate/);
  });
});
