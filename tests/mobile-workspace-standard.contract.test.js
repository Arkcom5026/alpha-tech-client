import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('mobile workspace system standard', () => {
  it('provides reusable shell, section and sticky action primitives', () => {
    const source = read('src/components/workspace/MobileWorkspace.jsx');
    expect(source).toContain('export const MobileWorkspace');
    expect(source).toContain('export const MobileWorkspaceSection');
    expect(source).toContain('export const MobileActionBar');
    expect(source).toContain('bottom-3');
    expect(source).toContain('min-h-12');
  });

  it('uses the standard on branch communication settings', () => {
    const page = read('src/features/communication/pages/CommunicationProfileSettingsPage.jsx');
    expect(page).toContain('<MobileWorkspace');
    expect(page).toContain('<MobileWorkspaceSection');
    expect(page).toContain('<MobileActionBar>');
  });
});
