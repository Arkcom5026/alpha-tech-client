import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Residual experience and trace position authority UI contract', () => {
  it('exposes communication, store experience and product trace capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/residualExperienceTraceCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    for (const capability of [
      'communication.access',
      'communication.profile.manage',
      'store-experience.read',
      'store-experience.manage',
      'store-experience.publish',
      'product.trace.read',
      'product.trace.financials',
    ]) {
      expect(groupSource).toContain(capability);
    }

    expect(formSource).toContain('COMMUNICATION_CAPABILITY_GROUP,');
    expect(formSource).toContain('STORE_EXPERIENCE_CAPABILITY_GROUP,');
    expect(formSource).toContain('PRODUCT_TRACE_CAPABILITY_GROUP,');
  });
});
