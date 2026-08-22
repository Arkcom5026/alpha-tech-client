import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Residual business surface position authority UI contract', () => {
  it('exposes communication, store experience and product trace capability groups', () => {
    const formSource = read('src/features/position/components/PositionForm.jsx');
    const communicationSource = read('src/features/position/components/communicationCapabilityGroup.js');
    const storeExperienceSource = read('src/features/position/components/storeExperienceCapabilityGroup.js');
    const productTraceSource = read('src/features/position/components/productTraceCapabilityGroup.js');

    expect(communicationSource).toContain("READ: 'communication.read'");
    expect(communicationSource).toContain("PROFILE_MANAGE: 'communication.profile.manage'");

    expect(storeExperienceSource).toContain("READ: 'store-experience.read'");
    expect(storeExperienceSource).toContain("MANAGE: 'store-experience.manage'");
    expect(storeExperienceSource).toContain("PUBLISH: 'store-experience.publish'");
    expect(storeExperienceSource).toContain("MEDIA: 'store-experience.media'");

    expect(productTraceSource).toContain("READ: 'product.trace.read'");
    expect(productTraceSource).toContain("FINANCIAL: 'product.trace.financial'");

    expect(formSource).toContain("import { COMMUNICATION_CAPABILITY_GROUP } from './communicationCapabilityGroup';");
    expect(formSource).toContain("import { STORE_EXPERIENCE_CAPABILITY_GROUP } from './storeExperienceCapabilityGroup';");
    expect(formSource).toContain("import { PRODUCT_TRACE_CAPABILITY_GROUP } from './productTraceCapabilityGroup';");
    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(formSource).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
    expect(formSource).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
  });
});
