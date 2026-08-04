'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const api = fs.readFileSync(path.resolve(__dirname, '../src/features/storeExperience/api/storeExperienceApi.js'), 'utf8');
const page = fs.readFileSync(path.resolve(__dirname, '../src/features/storeExperience/pages/StoreHomepageEditorPage.jsx'), 'utf8');

assert.match(api, /savePartnerStoreCapability[\s\S]*storefrontEnabled:\s*false/, 'capability saves must remain non-public until backend publish authority succeeds');
assert.match(api, /post\('\/store-experience\/publish'\)/, 'publish endpoint must be server-authoritative');
assert.match(page, /publishStoreExperience\(\)/, 'publish handler must delegate final activation to backend');

console.log('store experience publish authority order contract: PASS');
