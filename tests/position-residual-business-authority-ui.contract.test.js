import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Residual business position authority UI contract', () => {
  it('exposes communication, product trace, and store experience capabilities in PositionForm', () => {
    const groupSource = read('src/features/position/components/residualBusinessCapabilityGroups.js');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    for (const capability of [
      'communication.access',
      'communication.profile.manage',
      'product.trace.read',
      'product.trace.financial',
      'store-experience.read',
      'store-experience.manage',
      'store-experience.publish',
    ]) {
      expect(groupSource).toContain(`'${capability}'`);
    }

    expect(groupSource).toContain("key: 'communication'");
    expect(groupSource).toContain("key: 'product-trace'");
    expect(groupSource).toContain("key: 'store-experience'");
    expect(formSource).toContain("import { RESIDUAL_BUSINESS_CAPABILITY_GROUPS } from './residualBusinessCapabilityGroups';");
    expect(formSource).toContain('...RESIDUAL_BUSINESS_CAPABILITY_GROUPS,');
  });
});
