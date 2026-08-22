import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Grouped residual governance position authority UI contract', () => {
  it('exposes communication, store experience and product trace capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/residualGovernanceCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("READ: 'communication.read'");
    expect(groupSource).toContain("OPERATE: 'communication.operate'");
    expect(groupSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("READ: 'store-experience.read'");
    expect(groupSource).toContain("MANAGE: 'store-experience.manage'");
    expect(groupSource).toContain("PUBLISH: 'store-experience.publish'");
    expect(groupSource).toContain("READ: 'product.trace.read'");
    expect(groupSource).toContain("FINANCIALS: 'product.trace.financials'");
    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(formSource).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
    expect(formSource).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
  });
});
