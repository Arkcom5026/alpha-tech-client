'use strict';

const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, '../src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');
const source = fs.readFileSync(target, 'utf8');

const importAnchor = "} from '../api/storeExperienceApi';\n";
const defaultsStart = 'const SECTION_OPTIONS = [';
const defaultsEnd = "const fieldClass = '";
const capabilityStart = '  const capabilityPayload = (enabled = capability.storefrontEnabled) => ({';
const draftEnd = '  });\n\n  const run = async (operation) => {';

const completedMarkers = [
  "from '../constants/storeExperienceDefaults'",
  "from '../utils/storeExperiencePayloads'",
  'buildCapabilityPayload(capability, capability.storefrontEnabled)',
  'buildDraftPayload(draft)',
];

const completedCount = completedMarkers.filter((marker) => source.includes(marker)).length;
if (completedCount === completedMarkers.length) {
  console.log('store experience foundation split already applied');
  process.exit(0);
}
if (completedCount > 0) throw new Error('partial store experience foundation split detected');

for (const anchor of [importAnchor, defaultsStart, defaultsEnd, capabilityStart, draftEnd]) {
  if (!source.includes(anchor)) throw new Error(`foundation split anchor missing: ${anchor}`);
}

const imports = `${importAnchor}import {\n  DEFAULT_CAPABILITY,\n  PLATFORM_THEME_TOKENS,\n  SECTION_OPTIONS,\n  createDefaultDraft,\n} from '../constants/storeExperienceDefaults';\nimport { buildCapabilityPayload, buildDraftPayload } from '../utils/storeExperiencePayloads';\n`;

let next = source.replace(importAnchor, imports);
const defaultsFrom = next.indexOf(defaultsStart);
const defaultsTo = next.indexOf(defaultsEnd);
if (defaultsFrom < 0 || defaultsTo <= defaultsFrom) throw new Error('invalid defaults extraction range');
next = `${next.slice(0, defaultsFrom)}${next.slice(defaultsTo)}`;

next = next
  .replace('useState(defaultCapability)', 'useState(DEFAULT_CAPABILITY)')
  .replace('useState(defaultDraft)', 'useState(createDefaultDraft())')
  .replaceAll('defaultCapability', 'DEFAULT_CAPABILITY')
  .replaceAll('defaultDraft.themeTokens', 'PLATFORM_THEME_TOKENS')
  .replaceAll('defaultDraft.sectionConfiguration', 'createDefaultDraft().sectionConfiguration');

const payloadFrom = next.indexOf(capabilityStart);
const payloadTo = next.indexOf(draftEnd, payloadFrom);
if (payloadFrom < 0 || payloadTo <= payloadFrom) throw new Error('invalid payload extraction range');
next = `${next.slice(0, payloadFrom)}  const run = async (operation) => {${next.slice(payloadTo + draftEnd.length)}`;

next = next
  .replace('capabilityPayload(capability.storefrontEnabled)', 'buildCapabilityPayload(capability, capability.storefrontEnabled)')
  .replace('capabilityPayload(true)', 'buildCapabilityPayload(capability, true)')
  .replaceAll('draftPayload()', 'buildDraftPayload(draft)');

fs.writeFileSync(target, next);
console.log('store experience foundation split applied');
