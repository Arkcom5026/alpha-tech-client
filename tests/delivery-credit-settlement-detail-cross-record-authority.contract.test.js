import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(
  path.resolve('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementDetailPage.jsx'),
  'utf8',
);

describe('delivery credit settlement detail cross-record authority contract', () => {
  it('sequences detail reads against the active settlement context', () => {
    expect(source).toContain("const recordContextRef = useRef(String(id || ''))");
    expect(source).toContain('const loadRequestRef = useRef(0)');
    expect(source).toContain('const requestId = ++loadRequestRef.current');
    expect(source).toContain('recordContextRef.current !== settlementIdSnapshot');
    expect(source).toContain('setRecord(null)');
  });

  it('binds cancellation completion to the same settlement record', () => {
    expect(source).toContain('const cancelRequestRef = useRef(0)');
    expect(source).toContain('const requestId = ++cancelRequestRef.current');
    expect(source).toContain('const ownsCancelRequest = () => (');
    expect(source).toContain('recordContextRef.current === settlementIdSnapshot');
    expect(source).toContain('customer-money-settlement:cancel:${settlementIdSnapshot}:context-changed:error');
  });

  it('does not release a newer record mutation from stale finally', () => {
    expect(source).toContain('if (ownsCancelRequest()) {');
    expect(source).toContain('cancellingRef.current = false');
    expect(source).toContain('setCancelling(false)');
  });
});
