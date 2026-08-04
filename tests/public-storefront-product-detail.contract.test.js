import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const router = read('src/routes/AppRouter.jsx');
const storefront = read('src/features/storefront/pages/PublicStorefrontPage.jsx');
const detail = read('src/features/storefront/pages/PublicStorefrontProductPage.jsx');

assert(router.includes("path: ':shopSlug/products/:productId'"), 'public product detail route missing');
assert(router.includes('PublicStorefrontProductPage'), 'public product detail page not registered');
assert(storefront.includes('/products/${product.id}'), 'product cards must link to detail');
assert(detail.includes('/sales/storefronts/${encodeURIComponent(shopSlug || \'\')}/products/${encodeURIComponent(productId || \'\')}'), 'detail API contract missing');
assert(detail.includes('skipAuthBootstrap: true'), 'detail must remain public');
assert(detail.includes('product.images') && detail.includes('product.priceOnline'), 'detail projection is incomplete');
assert(detail.includes("product.availability?.status === 'AVAILABLE'"), 'availability contract missing');
assert(detail.includes('storefront.fulfillment?.pickup?.enabled') && detail.includes('storefront.fulfillment?.delivery?.enabled'), 'fulfillment projection missing');
console.log('public storefront product detail contract: PASS');
