import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const router = fs.readFileSync(path.join(root, 'src/routes/AppRouter.jsx'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src/features/storefront/pages/PublicStorefrontPage.jsx'), 'utf8');

assert.match(router, /path: ':shopSlug', element: <PublicStorefrontPage \/>/);
assert.match(router, /path: ':shopSlug\/shop', element: <Navigate to="\.\.\/" relative="path" replace \/>/);
assert.match(router, /path: '\*', element: <Navigate to="\/" replace \/>/);
assert.match(page, /\/api\/sales\/storefronts\/\$\{encodeURIComponent\(shopSlug \|\| ''\)\}/);
assert.match(page, /storefront\.products/);
assert.doesNotMatch(page, /branchId|costPrice|supplier|employee|availableQuantity/);

console.log('canonical storefront route contract: PASS');
