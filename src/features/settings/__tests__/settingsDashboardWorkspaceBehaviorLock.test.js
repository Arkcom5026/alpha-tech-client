import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('settings dashboard workspace behavior lock', () => {
  it('preserves tenant-aware settings navigation destinations', () => {
    const workspace = read('workspaces/SettingsDashboardWorkspace.jsx');
    expect(workspace).toContain('useParams');
    expect(workspace).toContain('shopSlug');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/printers`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/storefront`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/online-products`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/staff`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/employee`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/positions`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/branches`');
    expect(workspace).toContain('`/${shopSlug}/pos/settings/bank`');
  });

  it('preserves the settings dashboard as a navigation hub without direct data mutation', () => {
    const workspace = read('workspaces/SettingsDashboardWorkspace.jsx');
    expect(workspace).toContain('SettingTile');
    expect(workspace).toContain('useNavigate');
    expect(workspace).not.toContain('apiClient.');
    expect(workspace).not.toContain('fetch(');
    expect(workspace).not.toContain('.post(');
    expect(workspace).not.toContain('.put(');
    expect(workspace).not.toContain('.patch(');
    expect(workspace).not.toContain('.delete(');
  });

  it('keeps SettingsDashboardPage as a thin workspace adapter', () => {
    const page = read('pages/SettingsDashboardPage.jsx');
    expect(page).toContain("import SettingsDashboardWorkspace from '../workspaces/SettingsDashboardWorkspace'");
    expect(page).toContain('export default SettingsDashboardWorkspace');
    expect(page).not.toContain('useNavigate');
    expect(page).not.toContain('SettingTile');
  });
});
