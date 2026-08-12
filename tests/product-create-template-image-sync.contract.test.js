import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const read = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

const apiSource = read('src/features/product/create/api/productCreateApi.js');
const controllerSource = read('src/features/product/create/hooks/useProductCreateRuntimeController.js');

assert.match(apiSource, /syncTemplateImage = false/);
assert.match(apiSource, /formData\.append\('syncTemplateImage', 'true'\)/);
assert.match(apiSource, /i === normalizedCoverIndex \? 0 : -1/);
assert.match(apiSource, /templateImageSync: data\?\.templateImageSync \|\| null/);

assert.match(controllerSource, /response\?\.templateSync\?\.status === 'REVERSE_CLONED'/);
assert.match(controllerSource, /syncTemplateImage: shouldSyncTemplateImages/);
assert.doesNotMatch(controllerSource, /MATCHED_UNLINKED'.*syncTemplateImage/s);
assert.doesNotMatch(controllerSource, /LINKED_TEMPLATE'.*syncTemplateImage/s);

console.log('Product Create Template Image Sync Contract: PASS');
