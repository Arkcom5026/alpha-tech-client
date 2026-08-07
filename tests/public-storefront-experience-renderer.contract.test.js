import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const page = fs.readFileSync(
  path.resolve(__dirname, '../src/features/storefront/pages/PublicStorefrontPage.jsx'),
  'utf8'
);

const assertIncludes = (value, label) => {
  assert.ok(page.includes(value), `${label} missing: ${value}`);
};

assertIncludes('storeState.storefront?.experience', 'renderer must consume published experience');
assertIncludes('experience.themeTokens', 'renderer must apply published theme tokens');
assertIncludes('experience.sectionConfiguration', 'renderer must honor published section configuration');
assertIncludes('apiClient.get(`/sales/storefronts/${slug}`', 'published storefront must load independently from product discovery');
assertIncludes("apiClient.get(`/sales/storefronts/${encodeURIComponent(shopSlug || '')}/products?${params.toString()}`", 'renderer must load public store-scoped products');
assertIncludes("error?.response?.data?.message || 'ไม่สามารถค้นหาสินค้าได้'", 'product discovery failure must degrade without hiding the store');
assertIncludes("section.type === 'HERO'", 'renderer must support hero section');
assertIncludes("section.type === 'FEATURED_PRODUCTS'", 'renderer must support featured products');
assertIncludes("section.type === 'PRODUCT_GRID'", 'renderer must support product grid');
assertIncludes("section.type === 'FULFILLMENT'", 'renderer must support fulfillment');
assertIncludes("section.type === 'CONTACT'", 'renderer must support contact');
assertIncludes("experience.layoutPreset === 'catalog-list'", 'renderer must respect layout preset');
assert.doesNotMatch(page, /Promise\.all\s*\(/, 'storefront availability must not depend on product discovery');
assert.doesNotMatch(page, /costPrice|avgCost|lastReceivedCost/, 'public renderer must not expose internal cost data');

const errorGuardIndex = page.indexOf('if (storeState.error)');
const notFoundGuardIndex = page.indexOf('if (storeState.notFound || !storeState.storefront)');
assert.ok(errorGuardIndex >= 0 && notFoundGuardIndex >= 0 && errorGuardIndex < notFoundGuardIndex, 'runtime errors must not be mislabeled as an unpublished storefront');

console.log('public storefront experience renderer contract: PASS');
