import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const api = fs.readFileSync(path.resolve(__dirname, '../src/features/storeExperience/api/storeExperienceApi.js'), 'utf8');
const page = fs.readFileSync(path.resolve(__dirname, '../src/features/storeExperience/pages/StoreHomepageEditorPage.jsx'), 'utf8');

assert.match(api, /nonPublicCapabilityPayload[\s\S]*key\s*!==\s*'storefrontEnabled'/, 'generic capability saves must not mutate public activation authority');
assert.match(api, /savePartnerStoreCapability[\s\S]*nonPublicCapabilityPayload\(payload\)/, 'capability saves must strip public activation state');
assert.match(api, /post\('\/store-experience\/publish'\)/, 'publish endpoint must be server-authoritative');
assert.match(page, /publishStoreExperience\(\)/, 'publish handler must delegate final activation to backend');

console.log('store experience publish authority order contract: PASS');
