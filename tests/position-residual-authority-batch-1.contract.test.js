import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Position residual authority batch 1 UI contract', () => {
  it('exposes communication, product trace and store experience capability groups', () => {
    const form = read('src/features/position/components/PositionForm.jsx');
    const communication = read('src/features/position/components/communicationCapabilityGroup.js');
    const trace = read('src/features/position/components/productTraceCapabilityGroup.js');
    const storeExperience = read('src/features/position/components/storeExperienceCapabilityGroup.js');

    expect(communication).toContain("USE: 'communication.use'");
    expect(communication).toContain("PROFILE_MANAGE: 'communication.profile.manage'");
    expect(trace).toContain("READ: 'product.trace.read'");
    expect(trace).toContain("FINANCIAL_READ: 'product.trace.financial.read'");
    expect(storeExperience).toContain("READ: 'store.experience.read'");
    expect(storeExperience).toContain("MANAGE: 'store.experience.manage'");
    expect(storeExperience).toContain("PUBLISH: 'store.experience.publish'");

    expect(form).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(form).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
    expect(form).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
  });
});
