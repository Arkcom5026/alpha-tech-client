import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Operational residual position authority UI contract', () => {
  it('exposes communication, store experience and product trace capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/operationalResidualCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("OPERATE: 'communication.operate'");
    expect(groupSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("READ: 'store-experience.read'");
    expect(groupSource).toContain("MANAGE: 'store-experience.manage'");
    expect(groupSource).toContain("PUBLISH: 'store-experience.publish'");
    expect(groupSource).toContain("READ: 'product.trace.read'");
    expect(groupSource).toContain("FINANCIALS: 'product.trace.financials'");
    expect(groupSource).toContain("key: 'communication'");
    expect(groupSource).toContain("key: 'store-experience'");
    expect(groupSource).toContain("key: 'product-trace'");
    expect(formSource).toContain("import { OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS } from './operationalResidualCapabilityGroups';");
    expect(formSource).toContain('...OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS,');
  });
});
