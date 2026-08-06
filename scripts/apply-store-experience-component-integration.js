import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const target = path.join(root, 'src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');

const fail = (message) => {
  console.error(`store experience component integration: ${message}`);
  process.exit(1);
};

const source = fs.readFileSync(target, 'utf8');
const requiredImports = [
  "import StoreStudioHeader from '../components/StoreStudioHeader';",
  "import StoreStudioNavigation from '../components/StoreStudioNavigation';",
  "import StoreIdentityPanel from '../components/StoreIdentityPanel';",
];
const complete = requiredImports.every((value) => source.includes(value))
  && source.includes('<StoreStudioHeader')
  && source.includes('<StoreStudioNavigation')
  && source.includes('<StoreIdentityPanel');

if (complete) {
  console.log('store experience component integration: already applied');
  process.exit(0);
}

if (requiredImports.some((value) => source.includes(value)) || source.includes('<StoreStudioHeader') || source.includes('<StoreStudioNavigation') || source.includes('<StoreIdentityPanel')) {
  fail('partial integration detected; refusing to modify');
}

const importAnchor = "} from '../api/storeExperienceApi';\n";
if ((source.match(new RegExp(importAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length !== 1) {
  fail('API import anchor must exist exactly once');
}

let next = source.replace(importAnchor, `${importAnchor}${requiredImports.join('\n')}\n`);

const headerStart = '      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">';
const headerEnd = '      </section>\n\n      {state.error ?';
const headerStartIndex = next.indexOf(headerStart);
const headerEndIndex = next.indexOf(headerEnd, headerStartIndex);
if (headerStartIndex < 0 || headerEndIndex < 0) fail('header block anchors missing');
const headerReplacement = `      <StoreStudioHeader\n        capability={capability}\n        isLive={isLive}\n        hasDraftChanges={hasDraftChanges}\n        busy={state.busy}\n        onPreview={preview}\n        onSave={save}\n        onPublish={publish}\n      />\n\n      {state.error ?`;
next = next.slice(0, headerStartIndex) + headerReplacement + next.slice(headerEndIndex + headerEnd.length);

const navigationStart = '        <aside className="space-y-4">';
const navigationEnd = '        </aside>\n\n        <main className="space-y-6">';
const navigationStartIndex = next.indexOf(navigationStart);
const navigationEndIndex = next.indexOf(navigationEnd, navigationStartIndex);
if (navigationStartIndex < 0 || navigationEndIndex < 0) fail('navigation block anchors missing');
const navigationReplacement = `        <StoreStudioNavigation\n          activePanel={activePanel}\n          onChange={setActivePanel}\n          isLive={isLive}\n          busy={state.busy}\n          onUnpublish={unpublish}\n        />\n\n        <main className="space-y-6">`;
next = next.slice(0, navigationStartIndex) + navigationReplacement + next.slice(navigationEndIndex + navigationEnd.length);

const identityStart = "          {activePanel === 'identity' ? (\n            <section";
const mediaStart = "\n\n          {activePanel === 'media' ? (";
const identityStartIndex = next.indexOf(identityStart);
const mediaStartIndex = next.indexOf(mediaStart, identityStartIndex);
if (identityStartIndex < 0 || mediaStartIndex < 0) fail('identity block anchors missing');
const identityReplacement = `          {activePanel === 'identity' ? (\n            <StoreIdentityPanel\n              capability={capability}\n              contentConfiguration={draft.contentConfiguration}\n              onCapabilityChange={setCapability}\n              onContentChange={(contentConfiguration) => setDraft((current) => ({ ...current, contentConfiguration }))}\n            />\n          ) : null}`;
next = next.slice(0, identityStartIndex) + identityReplacement + next.slice(mediaStartIndex);

for (const token of ['Online Store Studio</span>', 'พื้นที่จัดการ</p>', '<h2 className="text-lg font-black text-slate-950">ภาพลักษณ์ร้าน</h2>']) {
  if (next.includes(token)) fail(`legacy JSX remained after integration: ${token}`);
}

fs.writeFileSync(target, next, 'utf8');
console.log('store experience component integration: APPLIED');
