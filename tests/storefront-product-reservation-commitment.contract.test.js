import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const apiSource = read('src/features/storefront/api/storefrontCommitmentApi.js');
const identitySource = read('src/features/storefront/pages/PublicStorefrontIdentityPage.jsx');

assert(apiSource.includes('/commitment'), 'Client must call the public ProductReservation commitment endpoint');
assert(apiSource.includes("'X-Anonymous-Session-Token'"), 'Commitment must send anonymous-session authority');
assert(apiSource.includes("'X-Commerce-Identity-Proof'"), 'Commitment must send identity-proof authority');
assert(apiSource.includes("'X-Idempotency-Key'"), 'Commitment must send idempotency authority');
assert(apiSource.includes('getOrCreateCommitmentIdempotencyKey'), 'Commitment key must survive retry for the same storefront command');
assert(apiSource.includes('clearStorefrontCommitmentAuthority'), 'Consumed commitment authority must be cleared after success');

assert(identitySource.includes('commitProductReservation'), 'OTP success must continue to ProductReservation commitment');
assert(identitySource.includes('clearAnonymousCart(shopSlug)'), 'Committed cart must be cleared only after reservation success');
assert(identitySource.includes('reservation.code'), 'Success UI must expose the reservation reference');
assert(identitySource.includes('reservation.expiresAt'), 'Success UI must expose reservation expiry');
assert(identitySource.includes('retryReservation'), 'A failed network response after OTP verification must support idempotent retry');
assert(!identitySource.includes('Increment ถัดไป'), 'Identity page must not stop at the former placeholder boundary');

console.log('storefront product reservation commitment contract: PASS');
