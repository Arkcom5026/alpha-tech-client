'use strict';

const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '../src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');
let source = fs.readFileSync(target, 'utf8');

const requiredImports = [
  "import StoreMediaPanel from '../components/StoreMediaPanel';",
  "import StoreHomepageSectionsPanel from '../components/StoreHomepageSectionsPanel';",
  "import StorefrontPreview from '../components/StorefrontPreview';",
];

const complete = requiredImports.every((entry) => source.includes(entry))
  && source.includes('<StoreMediaPanel />')
  && source.includes('<StoreHomepageSectionsPanel')
  && source.includes('<StorefrontPreview');

if (complete) {
  console.log('store experience workspace split already applied');
  process.exit(0);
}

if (requiredImports.some((entry) => source.includes(entry)) || source.includes('<StoreMediaPanel') || source.includes('<StoreHomepageSectionsPanel') || source.includes('<StorefrontPreview')) {
  throw new Error('partial workspace split detected; refusing to modify source');
}

const importAnchor = "import StoreIdentityPanel from '../components/StoreIdentityPanel';";
if (!source.includes(importAnchor)) throw new Error('component integration import anchor missing');
source = source.replace(importAnchor, `${importAnchor}\n${requiredImports.join('\n')}`);

const mediaStart = "          {activePanel === 'media' ? (";
const homepageStart = "          {activePanel === 'homepage' ? (";
const previewStart = '          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">';

for (const anchor of [mediaStart, homepageStart, previewStart]) {
  if (!source.includes(anchor)) throw new Error(`workspace anchor missing: ${anchor}`);
}

const mediaIndex = source.indexOf(mediaStart);
const homepageIndex = source.indexOf(homepageStart);
const previewIndex = source.indexOf(previewStart);
if (!(mediaIndex < homepageIndex && homepageIndex < previewIndex)) throw new Error('workspace anchors are out of order');

const replacement = `          {activePanel === 'media' ? <StoreMediaPanel /> : null}\n\n          {activePanel === 'homepage' ? (\n            <StoreHomepageSectionsPanel\n              sectionOptions={SECTION_OPTIONS}\n              sections={draft.sectionConfiguration || []}\n              onToggle={toggleSection}\n            />\n          ) : null}\n\n          <StorefrontPreview\n            capability={capability}\n            content={draft.contentConfiguration}\n            enabledSections={enabledSections}\n            mode={previewMode}\n            onModeChange={setPreviewMode}\n          />`;

const afterPreview = source.indexOf('\n        </main>', previewIndex);
if (afterPreview === -1) throw new Error('workspace end anchor missing');
source = `${source.slice(0, mediaIndex)}${replacement}${source.slice(afterPreview)}`;

for (const legacy of ['เตรียมสำหรับ Increment Media Library', 'เลือกว่าเนื้อหาส่วนใดควรปรากฏบนหน้าร้าน', 'ตัวอย่างใช้ธีมมาตรฐานของ Alpha-Tech']) {
  if (source.includes(legacy)) throw new Error(`legacy workspace JSX remains: ${legacy}`);
}

fs.writeFileSync(target, source, 'utf8');
console.log('store experience workspace split applied');
