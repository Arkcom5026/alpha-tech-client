import fs from 'node:fs';
import assert from 'node:assert/strict';

const quickStockApi = fs.readFileSync(
  'src/features/receiving/quick-stock/api/quickStockApi.js',
  'utf8'
);
const quickReceiptApi = fs.readFileSync(
  'src/features/receiving/quick-stock/api/quickReceiptSessionApi.js',
  'utf8'
);

assert.match(
  quickStockApi,
  /const dropdownTransportInFlight = new Map\(\)/,
  'Quick Stock dropdown transport must own an in-flight registry outside React lifecycle state'
);
assert.match(
  quickStockApi,
  /const existingRequest = dropdownTransportInFlight\.get\(requestKey\);[\s\S]*if \(existingRequest\) return existingRequest;/,
  'equivalent dropdown transport reads must reuse the active Promise'
);
assert.match(
  quickStockApi,
  /if \(dropdownTransportInFlight\.get\(requestKey\) === requestPromise\) \{[\s\S]*dropdownTransportInFlight\.delete\(requestKey\)/,
  'dropdown transport cleanup must not delete a newer owner Promise'
);

assert.match(
  quickReceiptApi,
  /const pendingReadRequests = new Map\(\)/,
  'Quick Receipt initial reads must share an in-flight registry across StrictMode effect re-entry'
);
assert.match(
  quickReceiptApi,
  /export const loadQuickReceiptSuppliers = \(\) => coalesceRead\('suppliers'/,
  'supplier bootstrap reads must be coalesced'
);
assert.match(
  quickReceiptApi,
  /return coalesceRead\(readFingerprint\('drafts', normalizedFilters\)/,
  'draft receipt bootstrap reads must be coalesced by normalized filters'
);
assert.match(
  quickReceiptApi,
  /if \(pendingReadRequests\.get\(fingerprint\) === requestPromise\) \{[\s\S]*pendingReadRequests\.delete\(fingerprint\)/,
  'initial-read cleanup must preserve newer request ownership'
);

console.log('Quick Stock StrictMode Read Coalescing Contract: PASS');
