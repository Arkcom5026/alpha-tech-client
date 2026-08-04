import fs from 'node:fs';
import assert from 'node:assert/strict';

const api = fs.readFileSync('src/features/storefront/api/storefrontCommitmentApi.js', 'utf8');
const cart = fs.readFileSync('src/features/storefront/pages/PublicStorefrontCartPage.jsx', 'utf8');
const identity = fs.readFileSync('src/features/storefront/pages/PublicStorefrontIdentityPage.jsx', 'utf8');
const router = fs.readFileSync('src/routes/AppRouter.jsx', 'utf8');

assert.match(api, /X-Anonymous-Session-Token/);
assert.match(api, /identity\/request/);
assert.match(api, /identity\/verify/);
assert.match(api, /commerce-identity-proof/);
assert.match(cart, /createAnonymousServerSession/);
assert.match(cart, /setAnonymousServerSessionItem/);
assert.match(cart, /ตรวจราคาและสต๊อก/);
assert.match(cart, /checkout\/identity/);
assert.match(identity, /Identity at Commitment/);
assert.match(identity, /requestCommitmentIdentity/);
assert.match(identity, /verifyCommitmentIdentity/);
assert.match(identity, /ยังไม่สร้างคำสั่งซื้อและยังไม่จองสต๊อก/);
assert.match(router, /:shopSlug\/checkout\/identity/);

console.log('cart server revalidation and identity commitment contract: PASS');
