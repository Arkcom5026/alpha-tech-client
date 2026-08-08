import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const router = fs.readFileSync(path.join(root, 'src/routes/AppRouter.jsx'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src/features/storefront/pages/PublicStorefrontPage.jsx'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8');

assert.match(router, /path: ':shopSlug', element: <PublicStorefrontPage \/>/);
assert.match(router, /path: ':shopSlug\/shop', element: <Navigate to="\.\.\/" relative="path" replace \/>/);
assert.match(router, /path: '\*', element: <NotFound \/>/);
assert.match(page, /const slug = encodeURIComponent\(shopSlug \|\| ''\)/);
assert.match(page, /apiClient\.get\(`\/sales\/storefronts\/\$\{slug\}`/);
assert.match(page, /skipAuthBootstrap:\s*true/);
assert.match(app, /PUBLIC_STOREFRONT_SLUG_PATTERN/);
assert.match(app, /PUBLIC_STOREFRONT_RESERVED_SLUGS/);
assert.match(page, /\/products\?\$\{params\.toString\(\)\}/);
assert.match(page, /const products = productState\.items/);
assert.doesNotMatch(page, /branchId|costPrice|supplier|employee|availableQuantity/);

console.log('canonical storefront route contract: PASS');
