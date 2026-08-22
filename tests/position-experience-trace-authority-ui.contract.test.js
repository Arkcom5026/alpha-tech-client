import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Position experience and trace authority UI contract', () => {
  it('exposes communication, store experience and product trace capabilities in PositionForm', () => {
    const communication = read('src/features/position/components/communicationCapabilityGroup.js');
    const storeExperience = read('src/features/position/components/storeExperienceCapabilityGroup.js');
    const productTrace = read('src/features/position/components/productTraceCapabilityGroup.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    expect(communication).toContain("ACCESS: 'communication.access'");
    expect(communication).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(storeExperience).toContain("MANAGE: 'store-experience.manage'");
    expect(productTrace).toContain("FINANCIALS: 'product.trace.financials'");

    expect(form).toContain("import { COMMUNICATION_CAPABILITY_GROUP } from './communicationCapabilityGroup';");
    expect(form).toContain("import { STORE_EXPERIENCE_CAPABILITY_GROUP } from './storeExperienceCapabilityGroup';");
    expect(form).toContain("import { PRODUCT_TRACE_CAPABILITY_GROUP } from './productTraceCapabilityGroup';");
    expect(form).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(form).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
    expect(form).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
  });
});
