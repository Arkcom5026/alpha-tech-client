'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const page = fs.readFileSync(path.resolve(__dirname, '../src/features/storefront/pages/PublicStorefrontPage.jsx'), 'utf8');

assert.match(page, /storefront\.experience/, 'renderer must consume published experience');
assert.match(page, /experience\.themeTokens/, 'renderer must apply published theme tokens');
assert.match(page, /experience\.sectionConfiguration/, 'renderer must honor published section configuration');
assert.match(page, /sales\/storefronts\/\$\{slug\}\/products/, 'renderer must load public store-scoped products');
assert.match(page, /section\.type === 'HERO'/, 'renderer must support hero section');
assert.match(page, /section\.type === 'FEATURED_PRODUCTS'/, 'renderer must support featured products');
assert.match(page, /section\.type === 'PRODUCT_GRID'/, 'renderer must support product grid');
assert.match(page, /section\.type === 'FULFILLMENT'/, 'renderer must support fulfillment');
assert.match(page, /section\.type === 'CONTACT'/, 'renderer must support contact');
assert.match(page, /experience\.layoutPreset === 'catalog-list'/, 'renderer must respect layout preset');
assert.doesNotMatch(page, /costPrice|avgCost|lastReceivedCost/, 'public renderer must not expose internal cost data');

console.log('public storefront experience renderer contract: PASS');
