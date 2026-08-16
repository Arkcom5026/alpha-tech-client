import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/supplier/workspace/SupplierCreateWorkspace.jsx', 'utf8');

assert.match(source, /createRequestRef = useRef\(0\)/, 'create request sequencing authority must exist');
assert.match(source, /createContextRef = useRef\(\{ shopSlug: '', branchId: null \}\)/, 'shop and branch context authority must exist');
assert.match(source, /const shopSlugSnapshot = shopSlug \|\| '';/, 'shop slug must be snapshotted before persistence');
assert.match(source, /const branchIdSnapshot = branchId;/, 'branch id must be snapshotted before persistence');
assert.match(source, /createSupplierPaths\(shopSlugSnapshot\)\.list/, 'post-create navigation must use immutable route snapshot');
assert.match(source, /currentContext\.shopSlug === shopSlugSnapshot/, 'post-persistence writes must verify shop ownership');
assert.match(source, /currentContext\.branchId === branchIdSnapshot/, 'post-persistence writes must verify branch ownership');
assert.match(source, /supplier:create:\$\{branchIdSnapshot\}:context-changed:error/, 'context change after persistence must have explicit partial-success feedback');
assert.match(source, /supplier:create:\$\{branchIdSnapshot\}:success/, 'success feedback must be branch scoped');
assert.match(source, /supplier:create:\$\{branchIdSnapshot\}:error/, 'failure feedback must be branch scoped');

console.log('Supplier Create Cross-Context Authority Contract: PASS');
