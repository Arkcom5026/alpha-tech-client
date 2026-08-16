import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Vercel Git deployment policy', () => {
  it('disables automatic Git-triggered Vercel deployments', () => {
    const config = JSON.parse(read('vercel.json'));
    expect(config.git?.deploymentEnabled).toBe(false);
  });

  it('keeps Production deployment under the guarded GitHub Actions release workflow', () => {
    const workflow = read('.github/workflows/production-release.yml');
    expect(workflow).toContain('Verify approved SHA is current main');
    expect(workflow).toContain('vercel deploy --prod --yes --token "$VERCEL_TOKEN"');
  });
});
