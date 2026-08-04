import fs from 'node:fs';
import assert from 'node:assert/strict';

const store = fs.readFileSync('src/features/storefront/cart/anonymousCartStore.js', 'utf8');
const cartPage = fs.readFileSync('src/features/storefront/pages/PublicStorefrontCartPage.jsx', 'utf8');
const productPage = fs.readFileSync('src/features/storefront/pages/PublicStorefrontProductPage.jsx', 'utf8');
const router = fs.readFileSync('src/routes/AppRouter.jsx', 'utf8');

assert.match(store, /alpha-tech:anonymous-cart:v1/);
assert.match(store, /stores:\s*\{\}/);
assert.match(store, /normalizeSlug/);
assert.match(store, /priceSnapshot/);
assert.match(store, /availableQuantitySnapshot/);
assert.match(store, /sanitizeQuantity/);
assert.match(store, /useSyncExternalStore/);
assert.match(store, /EMPTY_STATE/);
assert.match(store, /useMemo\(\(\) => selectAnonymousCart\(state, slug\)/);
assert.doesNotMatch(store, /useSyncExternalStore\([^\n]*getAnonymousCart/);
assert.match(productPage, /addAnonymousCartItem/);
assert.match(productPage, /ยังไม่จองสต๊อกและยังไม่สร้างคำสั่งซื้อ/);
assert.match(productPage, /`\/\$\{shopSlug\}\/cart`/);
assert.match(cartPage, /จำนวนและราคาจะถูกตรวจสอบใหม่กับร้าน/);
assert.match(cartPage, /continueToIdentity/);
assert.match(cartPage, /createAnonymousServerSession/);
assert.match(cartPage, /setAnonymousServerSessionItem/);
assert.match(cartPage, /ตรวจสอบและยืนยันตัวตน/);
assert.match(cartPage, /ยังไม่สร้าง Order หรือ ProductReservation/);
assert.match(router, /:shopSlug\/cart/);
assert.match(router, /:shopSlug\/checkout\/identity/);
assert.doesNotMatch(store, /orderId|reservationId|createOrder|createReservation/i);

console.log('anonymous cart foundation contract: PASS');
