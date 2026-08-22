import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Operational residual position authority UI contract', () => {
  it('exposes communication, product trace and store experience capabilities in PositionForm', () => {
    const groups = read('src/features/position/components/operationalResidualCapabilityGroups.js');
    const form = read('src/features/position/components/PositionForm.jsx');

    for (const capability of [
      'communication.use',
      'communication.profile.manage',
      'product.trace.read',
      'product.trace.financial',
      'store-experience.read',
      'store-experience.manage',
      'store-experience.publish',
    ]) {
      expect(groups).toContain(capability);
    }

    expect(groups).toContain("key: 'communication'");
    expect(groups).toContain("key: 'product-trace'");
    expect(groups).toContain("key: 'store-experience'");
    expect(form).toContain("import { OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS } from './operationalResidualCapabilityGroups';");
    expect(form).toContain('...OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS,');
  });
});
