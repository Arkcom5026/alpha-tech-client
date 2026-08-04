'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const api = read('src/features/storeExperience/api/storeExperienceApi.js');
const page = read('src/features/storeExperience/pages/StoreHomepageEditorPage.jsx');

assert.match(api, /post\('\/store-experience\/publish'\)/, 'publish API command must exist');
assert.match(api, /post\('\/store-experience\/unpublish'\)/, 'unpublish API command must exist');
assert.match(page, /เผยแพร่หน้าร้าน/, 'publish action must be visible');
assert.match(page, /ยกเลิกเผยแพร่/, 'unpublish action must be visible');
assert.match(page, /window\.open\(`\/\$\{slug\}`/, 'preview must open current storefront slug');
assert.match(page, /status: 'PUBLISHED'/, 'published response must update UI status');

console.log('store experience publish UI contract: PASS');
