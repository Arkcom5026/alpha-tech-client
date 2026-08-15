import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

test('verified commitment proof is persisted and can be explicitly cleared', () => {
  const api = read('src/features/storefront/api/storefrontCommitmentApi.js');
  assert.match(api, /getCommerceIdentityProof/);
  assert.match(api, /setCommerceIdentityProof/);
  assert.match(api, /clearCommerceIdentityProof/);
  assert.match(api, /window\.localStorage\.removeItem\(proofKey\(shopSlug\)\)/);
});

test('identity page resumes a verified proof after refresh before requesting another OTP', () => {
  const page = read('src/features/storefront/pages/PublicStorefrontIdentityPage.jsx');
  assert.match(page, /useState\(\(\) => getCommerceIdentityProof\(shopSlug\)\)/);
  assert.match(page, /proofToken \? \(/);
  assert.match(page, /ดำเนินการจองต่อ/);
  assert.match(page, /await createReservation\(proofToken\)/);
});

test('expired or consumed proof returns customer to a replaceable OTP path', () => {
  const page = read('src/features/storefront/pages/PublicStorefrontIdentityPage.jsx');
  assert.match(page, /COMMITMENT_IDENTITY_PROOF_INVALID/);
  assert.match(page, /COMMITMENT_IDENTITY_PROOF_CONFLICT/);
  assert.match(page, /clearCommerceIdentityProof\(shopSlug\)/);
  assert.match(page, /setChallengeNeedsReplacement\(true\)/);
  assert.match(page, /ขอรหัส OTP ใหม่/);
});

test('reservation retry retains the original idempotency authority', () => {
  const api = read('src/features/storefront/api/storefrontCommitmentApi.js');
  const page = read('src/features/storefront/pages/PublicStorefrontIdentityPage.jsx');
  assert.match(api, /getOrCreateCommitmentIdempotencyKey/);
  assert.match(api, /X-Idempotency-Key/);
  assert.match(page, /commitmentKey: getOrCreateCommitmentIdempotencyKey\(shopSlug\)/);
});
