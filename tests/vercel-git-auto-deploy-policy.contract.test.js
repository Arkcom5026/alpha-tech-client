import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Vercel Git deployment policy', () => {
  it('allows Git-triggered deployment only for main and blocks every other branch, including slash-named branches', () => {
    const config = JSON.parse(read('vercel.json'));
    expect(config.git?.deploymentEnabled).toEqual({
      main: true,
      '**': false,
    });
  });

  it('uses the ignored-build gate as defense in depth against preview quota usage', () => {
    const config = JSON.parse(read('vercel.json'));
    expect(config.ignoreCommand).toContain('$VERCEL_ENV');
    expect(config.ignoreCommand).toContain('production');
    expect(config.ignoreCommand).toContain('exit 1');
    expect(config.ignoreCommand).toContain('exit 0');
  });

  it('keeps manual Production deployment guarded to the exact current main SHA', () => {
    const workflow = read('.github/workflows/production-release.yml');
    expect(workflow).toContain('Verify approved SHA is current main');
    expect(workflow).toContain('vercel deploy --prod --yes --token "$VERCEL_TOKEN"');
  });
});
