import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Position residual authority batch 1 UI contract', () => {
  it('exposes communication, store experience and product trace capability groups', () => {
    const groupSource = read('src/features/position/components/residualAuthorityCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("READ: 'communication.read'");
    expect(groupSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("MANAGE: 'store-experience.manage'");
    expect(groupSource).toContain("PUBLISH: 'store-experience.publish'");
    expect(groupSource).toContain("READ: 'product.trace.read'");
    expect(groupSource).toContain("FINANCIAL: 'product.trace.financial'");

    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(formSource).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
    expect(formSource).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
  });
});
