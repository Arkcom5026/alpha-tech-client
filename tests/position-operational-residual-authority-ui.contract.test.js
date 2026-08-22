import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Operational residual position authority UI contract', () => {
  it('exposes communication, store experience and product trace capability groups in PositionForm', () => {
    const groupSource = read('src/features/position/components/operationalResidualCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    for (const capability of [
      'communication.access',
      'communication.profile.manage',
      'store-experience.read',
      'store-experience.manage',
      'store-experience.publish',
      'product.trace.read',
      'product.trace.financial',
    ]) {
      expect(groupSource).toContain(capability);
    }

    expect(groupSource).toContain("key: 'communication'");
    expect(groupSource).toContain("key: 'store-experience'");
    expect(groupSource).toContain("key: 'product-trace'");
    expect(formSource).toContain("import { OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS } from './operationalResidualCapabilityGroups';");
    expect(formSource).toContain('...OPERATIONAL_RESIDUAL_CAPABILITY_GROUPS,');
  });
});
