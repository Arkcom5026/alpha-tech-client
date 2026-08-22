import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Operational residual position authority UI contract', () => {
  it('exposes communication, product trace financial and store experience capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/operationalResidualCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("ACCESS: 'communication.access'");
    expect(groupSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("FINANCIALS: 'product.trace.financials'");
    expect(groupSource).toContain("READ: 'store-experience.read'");
    expect(groupSource).toContain("MANAGE: 'store-experience.manage'");
    expect(groupSource).toContain("PUBLISH: 'store-experience.publish'");
    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(formSource).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
    expect(formSource).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
  });
});
