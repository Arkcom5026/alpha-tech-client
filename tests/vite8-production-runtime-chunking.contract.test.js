import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('Vite 8 production runtime chunking contract', () => {
  it('delegates production chunk graph ownership to Vite/Rolldown', () => {
    const config = read('vite.config.js');

    expect(config).not.toContain('manualChunks');
    expect(config).not.toContain('vendorChunkFor');
    expect(config).not.toContain("'vendor-misc'");
    expect(config).not.toContain("'vendor-react'");
  });

  it('keeps React resolved from the application dependency boundary', () => {
    const config = read('vite.config.js');

    expect(config).toContain("'react': path.resolve(__dirname, './node_modules/react')");
  });
});
