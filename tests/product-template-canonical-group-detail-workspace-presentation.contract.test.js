import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('product template canonical group detail workspace presentation contract', () => {
  const page = read('src/features/templateCandidate/pages/CanonicalGroupDetailPage.jsx');
  const header = read('src/features/templateCandidate/workspace/components/CanonicalGroupDetailHeader.jsx');
  const summary = read('src/features/templateCandidate/workspace/components/CanonicalGroupDetailSummary.jsx');
  const materialization = read('src/features/templateCandidate/workspace/components/CanonicalGroupMaterializationPanel.jsx');
  const reasons = read('src/features/templateCandidate/workspace/components/CanonicalGroupReviewReasons.jsx');
  const products = read('src/features/templateCandidate/workspace/components/CanonicalGroupSourceProducts.jsx');
  const presentation = [header, summary, materialization, reasons, products].join('\n');

  it('keeps extracted canonical-group components presentation-only', () => {
    expect(page).toContain('getCanonicalProductGroupApi');
    expect(page).toContain('materializeCanonicalProductGroupsApi');
    expect(presentation).not.toContain('getCanonicalProductGroupApi');
    expect(presentation).not.toContain('materializeCanonicalProductGroupsApi');
    expect(presentation).not.toContain('useSearchParams');
  });

  it('preserves the read-only group identity and source-product presentation', () => {
    expect(header).toContain('Canonical Group Detail');
    expect(header).toContain('แบบอ่านอย่างเดียว');
    expect(products).toContain('Source Products');
    expect(products).toContain('Product Type');
    expect(products).toContain('Branch #');
  });

  it('preserves READY materialization controls and result feedback', () => {
    expect(materialization).toContain('disabled={!canMaterialize || materializing}');
    expect(materialization).toContain('Candidate Materialization');
    expect(materialization).toContain('CREATED');
    expect(materialization).toContain('SKIPPED');
    expect(materialization).toContain('FAILED');
    expect(materialization).toContain('role="alert"');
    expect(materialization).toContain('min-h-11');
  });

  it('keeps summary and review reasons separated from data authority', () => {
    expect(summary).toContain('Business Type');
    expect(summary).toContain('Template Branch');
    expect(summary).toContain('Source Stores');
    expect(reasons).toContain('Review Reasons');
  });
});
