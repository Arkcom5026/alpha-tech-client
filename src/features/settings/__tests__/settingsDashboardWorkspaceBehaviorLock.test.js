import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(featureRoot, relativePath), 'utf8');

describe('settings dashboard workspace behavior lock', () => {
  it('preserves tenant-aware settings navigation destinations', () => {
    const page = read('pages/SettingsDashboardPage.jsx');
    expect(page).toContain('useParams');
    expect(page).toContain('shopSlug');
    expect(page).toContain('`/${shopSlug}/pos/settings/printers`');
    expect(page).toContain('`/${shopSlug}/pos/settings/storefront`');
    expect(page).toContain('`/${shopSlug}/pos/settings/online-products`');
    expect(page).toContain('`/${shopSlug}/pos/settings/staff`');
    expect(page).toContain('`/${shopSlug}/pos/settings/employee`');
    expect(page).toContain('`/${shopSlug}/pos/settings/positions`');
    expect(page).toContain('`/${shopSlug}/pos/settings/branches`');
    expect(page).toContain('`/${shopSlug}/pos/settings/bank`');
  });

  it('preserves the settings dashboard as a navigation hub without direct data mutation', () => {
    const page = read('pages/SettingsDashboardPage.jsx');
    expect(page).toContain('SettingTile');
    expect(page).toContain('useNavigate');
    expect(page).not.toContain('apiClient.');
    expect(page).not.toContain('fetch(');
    expect(page).not.toContain('.post(');
    expect(page).not.toContain('.put(');
    expect(page).not.toContain('.patch(');
    expect(page).not.toContain('.delete(');
  });
});
