'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');
const helperPaths = [
  'scripts/apply-store-experience-foundation-split.js',
  'scripts/apply-store-identity-content-editor.js',
  'scripts/apply-store-experience-component-integration.js',
  'scripts/apply-store-experience-workspace-split.js',
  'scripts/apply-store-experience-orchestration-split.js',
  'scripts/apply-store-experience-workspace-composer.js',
];

if (!fs.existsSync(pagePath)) {
  throw new Error('StoreHomepageEditorPage.jsx not found');
}

const page = fs.readFileSync(pagePath, 'utf8');
const requiredMarkers = [
  'useStoreExperienceStudio',
  '<StoreStudioHeader',
  '<StoreStudioNavigation',
  '<StoreStudioWorkspace',
];
const forbiddenMarkers = [
  'getPartnerStoreCapability(',
  'saveStoreExperienceDraft(',
  'SECTION_OPTIONS.map(',
  'themeTokens:',
];

for (const marker of requiredMarkers) {
  if (!page.includes(marker)) throw new Error(`Refactor is not complete; missing ${marker}`);
}
for (const marker of forbiddenMarkers) {
  if (page.includes(marker)) throw new Error(`Refactor is not complete; legacy marker remains: ${marker}`);
}

const pageLines = page.split(/\r?\n/).length;
if (pageLines > 140) {
  throw new Error(`Refactor is not complete; page has ${pageLines} lines (limit 140)`);
}

const existingHelpers = helperPaths
  .map((relativePath) => ({ relativePath, absolutePath: path.join(root, relativePath) }))
  .filter(({ absolutePath }) => fs.existsSync(absolutePath));

if (existingHelpers.length === 0) {
  console.log('Store Experience migration helpers already retired.');
  process.exit(0);
}

for (const { absolutePath } of existingHelpers) fs.unlinkSync(absolutePath);
console.log(`Retired ${existingHelpers.length} Store Experience migration helper(s).`);
