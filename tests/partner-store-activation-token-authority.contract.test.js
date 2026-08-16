import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/features/partnerStoreApplication/pages/PartnerStoreActivationPage.jsx', 'utf8');

assert.match(source, /const tokenRef = useRef\(token\)/);
assert.match(source, /const requestRef = useRef\(0\)/);
assert.match(source, /tokenRef\.current = token/);
assert.match(source, /requestRef\.current \+= 1/);
assert.match(source, /const activationToken = token/);
assert.match(source, /const requestId = requestRef\.current \+ 1/);
assert.match(source, /tokenRef\.current !== activationToken \|\| requestRef\.current !== requestId/);
assert.match(source, /context-changed:error/);
assert.match(source, /if \(tokenRef\.current === activationToken && requestRef\.current === requestId\)/);
assert.match(source, /const mutationBusy = submitting \|\| submittingRef\.current/);
assert.doesNotMatch(source, /partner-store:activation:success'/);

console.log('Partner Store Activation Token Authority Contract: PASS');
