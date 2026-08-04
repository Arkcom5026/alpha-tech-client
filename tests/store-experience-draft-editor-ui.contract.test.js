import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const routes = read('src/routes/partner/posPartnerRoutes.jsx');
const page = read('src/features/storeExperience/pages/StoreExperienceDraftEditorPage.jsx');

assert.match(routes, /StoreExperienceDraftEditorPage/);
assert.match(routes, /path: 'store-experience', element: <StoreExperienceDraftEditorPage \/>/);
assert.match(page, /apiClient\.get\('\/store-experience\/draft'\)/);
assert.match(page, /apiClient\.put\('\/store-experience\/draft'/);
assert.match(page, /themePresets/);
assert.match(page, /layoutPresets/);
assert.match(page, /sectionTypes/);
assert.match(page, /บันทึกฉบับร่าง/);
assert.doesNotMatch(page, /publish|custom html|custom css|custom javascript/i);

console.log('store experience draft editor UI contract: PASS');
