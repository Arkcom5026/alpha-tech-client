import fs from 'node:fs';
import assert from 'node:assert/strict';

const imageComponent = fs.readFileSync('src/features/storefront/components/PublicProductImage.jsx', 'utf8');
const storefrontPage = fs.readFileSync('src/features/storefront/pages/PublicStorefrontPage.jsx', 'utf8');
const productPage = fs.readFileSync('src/features/storefront/pages/PublicStorefrontProductPage.jsx', 'utf8');

assert.match(imageComponent, /resolvePublicAssetUrl/);
assert.match(imageComponent, /apiClient\?\.defaults\?\.baseURL/);
assert.match(imageComponent, /onError=\{\(\) => setFailed\(true\)\}/);
assert.match(imageComponent, /📦/);
assert.match(storefrontPage, /PublicProductImage/);
assert.match(storefrontPage, /src=\{product\.coverImageUrl\}/);
assert.match(productPage, /PublicProductImage/);
assert.match(productPage, /src=\{activeImage\}/);

console.log('marketplace product image pipeline contract: PASS');
