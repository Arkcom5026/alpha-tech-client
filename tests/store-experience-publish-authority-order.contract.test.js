'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const page = fs.readFileSync(path.resolve(__dirname, '../src/features/storeExperience/pages/StoreHomepageEditorPage.jsx'), 'utf8');

const publishBlock = page.match(/const publish = \(\) => run\(async \(\) => \{([\s\S]*?)\n  \}\);/);
assert.ok(publishBlock, 'publish handler must exist');
assert.match(publishBlock[1], /savePartnerStoreCapability\(capabilityPayload\(false\)\)/, 'publish must save capability as non-public before server publish authority');
assert.match(publishBlock[1], /publishStoreExperience\(\)/, 'publish must delegate final public activation to backend');
assert.doesNotMatch(publishBlock[1], /capabilityPayload\(true\)/, 'client must not pre-enable public storefront');

console.log('store experience publish authority order contract: PASS');
