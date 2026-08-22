import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Residual business position authority UI contract', () => {
  it('exposes communication, store experience and product trace financial capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/residualBusinessCapabilityGroup.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(groupSource).toContain("COMMUNICATION_OPERATE: 'communication.operate'");
    expect(groupSource).toContain("COMMUNICATION_PROFILE_MANAGE: 'communication.profile.manage'");
    expect(groupSource).toContain("STORE_EXPERIENCE_READ: 'store-experience.read'");
    expect(groupSource).toContain("STORE_EXPERIENCE_MANAGE: 'store-experience.manage'");
    expect(groupSource).toContain("STORE_EXPERIENCE_PUBLISH: 'store-experience.publish'");
    expect(groupSource).toContain("PRODUCT_TRACE_FINANCIALS: 'product.trace.financials'");
    expect(groupSource).toContain("key: 'residual-business-authority'");
    expect(formSource).toContain("import { RESIDUAL_BUSINESS_CAPABILITY_GROUP } from './residualBusinessCapabilityGroup';");
    expect(formSource).toContain('RESIDUAL_BUSINESS_CAPABILITY_GROUP,');
  });
});
