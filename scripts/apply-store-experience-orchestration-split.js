import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..');
const target = path.join(root, 'src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');
const source = fs.readFileSync(target, 'utf8');

const marker = "import useStoreExperienceStudio from '../hooks/useStoreExperienceStudio';";
const requiredLegacy = [
  "import { useEffect, useMemo, useState } from 'react';",
  'const [capability, setCapability] = useState(',
  'const [draft, setDraft] = useState(',
  'const save = () => run(async () => {',
  'const publish = () => run(async () => {',
  'const unpublish = () => run(async () => {',
];

if (source.includes(marker)) {
  const leftovers = requiredLegacy.filter((token) => source.includes(token));
  if (leftovers.length) throw new Error(`orchestration split is partial: ${leftovers.join(', ')}`);
  console.log('store experience orchestration split already applied');
  process.exit(0);
}

for (const token of requiredLegacy) {
  if (!source.includes(token)) throw new Error(`orchestration split anchor missing: ${token}`);
}

const componentStart = source.indexOf('const StoreHomepageEditorPage = () => {');
const loadingAnchor = source.indexOf('  if (state.loading) return', componentStart);
if (componentStart < 0 || loadingAnchor < 0 || loadingAnchor <= componentStart) {
  throw new Error('store homepage editor orchestration boundaries are invalid');
}

const importBoundary = source.indexOf("const fieldClass = ");
if (importBoundary < 0) throw new Error('style constant boundary missing');

let next = source;
next = next.replace("import { useEffect, useMemo, useState } from 'react';\n", '');
next = next.replace(/import \{[\s\S]*?\} from '\.\.\/api\/storeExperienceApi';\n/, '');
next = next.replace(
  "const StoreHomepageEditorPage = () => {",
  "const StoreHomepageEditorPage = () => {\n  const studio = useStoreExperienceStudio();\n  const {\n    capability,\n    draft,\n    state,\n    previewMode,\n    activePanel,\n    isLive,\n    hasDraftChanges,\n    enabledSections,\n    setPreviewMode,\n    setActivePanel,\n    updateCapability,\n    updateContent,\n    toggleSection,\n    save,\n    publish,\n    unpublish,\n    preview,\n  } = studio;"
);

const newComponentStart = next.indexOf('const StoreHomepageEditorPage = () => {');
const newLoadingAnchor = next.indexOf('  if (state.loading) return', newComponentStart);
const declarationEnd = next.indexOf('\n', next.indexOf('  } = studio;', newComponentStart)) + 1;
if (newLoadingAnchor < 0 || declarationEnd < 1 || newLoadingAnchor <= declarationEnd) {
  throw new Error('orchestration replacement boundaries are invalid');
}
next = next.slice(0, declarationEnd) + '\n' + next.slice(newLoadingAnchor);
next = next.slice(0, importBoundary) + marker + '\n' + next.slice(importBoundary);

next = next
  .replaceAll('setCapability((current) => ({ ...current, displayName: event.target.value }))', "updateCapability({ displayName: event.target.value })")
  .replaceAll('setCapability((current) => ({ ...current, storefrontSlug: event.target.value }))', "updateCapability({ storefrontSlug: event.target.value })")
  .replaceAll('setCapability((current) => ({ ...current, contactPhone: event.target.value }))', "updateCapability({ contactPhone: event.target.value })");

const forbidden = [
  "getPartnerStoreCapability()",
  "saveStoreExperienceDraft(",
  "publishStoreExperience()",
  "unpublishStoreExperience()",
  'const run = async',
];
for (const token of forbidden) {
  if (next.includes(token)) throw new Error(`business lifecycle remains in page: ${token}`);
}
if (!next.includes('useStoreExperienceStudio()')) throw new Error('studio hook was not connected');

fs.writeFileSync(target, next, 'utf8');
console.log('store experience orchestration split applied');
