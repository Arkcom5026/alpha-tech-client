'use strict';

const fs = require('node:fs');
const path = require('node:path');

const targetPath = path.resolve(__dirname, '../src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');
const source = fs.readFileSync(targetPath, 'utf8');

const importAnchor = "import StorefrontPreview from '../components/StorefrontPreview';";
const integrationMarker = "import StoreStudioWorkspace from '../components/StoreStudioWorkspace';";

if (source.includes(integrationMarker)) {
  console.log('store experience workspace composer: already applied');
  process.exit(0);
}

if (!source.includes(importAnchor)) {
  throw new Error('workspace composer import anchor missing; apply previous component split scripts first');
}

const workspaceStart = source.indexOf('<main className="space-y-6">');
const workspaceEndMarker = '</main>';
const workspaceEnd = source.indexOf(workspaceEndMarker, workspaceStart);

if (workspaceStart < 0 || workspaceEnd < 0) {
  throw new Error('workspace composer JSX anchor missing');
}

const legacyBlock = source.slice(workspaceStart, workspaceEnd + workspaceEndMarker.length);
for (const required of ['<StoreIdentityPanel', '<StoreMediaPanel', '<StoreHomepageSectionsPanel', '<StorefrontPreview']) {
  if (!legacyBlock.includes(required)) {
    throw new Error(`workspace composer partial state detected: ${required} missing`);
  }
}

const replacement = `<StoreStudioWorkspace
            activePanel={activePanel}
            capability={capability}
            content={content}
            enabledSections={enabledSections}
            previewMode={previewMode}
            onCapabilityChange={updateCapability}
            onIdentityChange={updateIdentity}
            onHeroChange={updateHero}
            onPreviewModeChange={setPreviewMode}
            onToggleSection={toggleSection}
          />`;

let next = source.replace(importAnchor, `${importAnchor}\n${integrationMarker}`);
next = next.replace(legacyBlock, replacement);

if (next === source) throw new Error('workspace composer produced no changes');
if ((next.match(/<StoreStudioWorkspace/g) || []).length !== 1) throw new Error('workspace composer must render exactly once');
if (/<main className="space-y-6">/.test(next)) throw new Error('legacy workspace wrapper remains after composition');

fs.writeFileSync(targetPath, next, 'utf8');
console.log('store experience workspace composer: applied');
