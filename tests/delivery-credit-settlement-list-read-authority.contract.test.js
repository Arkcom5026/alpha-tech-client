import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementListPage.jsx'),
  'utf8',
);

describe('delivery credit settlement list read authority contract', () => {
  it('owns list reads with a synchronous request sequence', () => {
    expect(source).toContain('const loadRequestRef = useRef(0)');
    expect(source).toContain('const requestId = ++loadRequestRef.current');
    expect(source).toContain('const ownsRequest = () => loadRequestRef.current === requestId');
  });

  it('discards stale success, error, and finally writes', () => {
    expect(source).toContain('if (!ownsRequest()) return { ok: false, stale: true, rows: [] }');
    expect(source).toContain('if (ownsRequest()) setLoading(false)');
  });

  it('invalidates in-flight reads on unmount and returns observable outcomes', () => {
    expect(source).toContain('loadRequestRef.current += 1');
    expect(source).toContain("return { ok: true, stale: false, rows: safeRows }");
    expect(source).toContain("return { ok: false, stale: false, error: message, rows: [] }");
  });
});
