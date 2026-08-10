import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(path.join(process.cwd(), 'src/features/repair/api/repairApi.js'), 'utf8');

const REQUIRED_PATHS = [
  '/repairs/intake-search',
  '/repairs/intake-context/',
  '/repairs/customers/',
  '/warranty-assets',
  '/repairs/jobs',
  '/repairs/intakes/external-device',
  '/tracking-access',
  '/estimate-approval',
  '/handover',
  '/handover/finalize',
  '/workflow/commands',
  '/parts',
  '/part-stock-options',
  '/warranty-claim-options',
  '/warranty-claims',
  '/replacement-options',
];

describe('repair API route parity', () => {
  it('keeps every current repair runtime API boundary wired', () => {
    for (const route of REQUIRED_PATHS) expect(source).toContain(route);
  });

  it('does not expose the retired free-status repair mutation', () => {
    expect(source).not.toContain('transitionJob:');
    expect(source).not.toContain('apiClient.patch(`/repairs/jobs/${id}/status`');
    expect(source).toContain('transitionWorkflow');
    expect(source).toContain('apiClient.patch(`/repairs/warranty-claims/${id}/status`');
  });

  it('keeps serialized repair-part discovery behind the repair boundary', () => {
    expect(source).toContain('getPartStockOptions');
    expect(source).toContain('/part-stock-options');
    expect(source).toContain('addPart');
  });
});
