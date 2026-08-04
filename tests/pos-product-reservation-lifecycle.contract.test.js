import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

const api = read('src/features/productReservation/merchant/api/productReservationMerchantApi.js');
const detail = read('src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx');

assertIncludes(api, 'executeMerchantProductReservationLifecycle', 'Merchant lifecycle API adapter is required');
assertIncludes(api, '/lifecycle', 'Lifecycle endpoint must be called');
assertIncludes(api, 'X-Idempotency-Key', 'Lifecycle mutation must send idempotency authority');
assertIncludes(api, 'commandType', 'Lifecycle command type must be explicit');
assertIncludes(api, 'reason', 'Lifecycle cancellation reason must be supported');

assertIncludes(detail, "executeLifecycle('ACCEPT')", 'ACTIVE reservations must be accepted from POS');
assertIncludes(detail, "executeLifecycle('CANCEL', normalizedReason)", 'Cancellation must send a reason');
assertIncludes(detail, "reservation.status === 'ACTIVE'", 'Accept action must be status-gated');
assertIncludes(detail, "['ACTIVE', 'ACCEPTED'].includes(reservation.status)", 'Cancellation must follow lifecycle boundary');
assertIncludes(detail, 'createIdempotencyKey', 'Each merchant command must have an idempotency key');
assertIncludes(detail, 'Timeline ใบจอง', 'Detail must expose lifecycle evidence');
assertIncludes(detail, 'event.commandType', 'Timeline must render command authority');
assertIncludes(detail, 'event.fromStatus', 'Timeline must render source status');
assertIncludes(detail, 'event.toStatus', 'Timeline must render target status');
assertIncludes(detail, 'await loadReservation()', 'Detail must refresh server authority after mutation');
assertIncludes(detail, 'ระบุเหตุผลที่ยกเลิกใบจอง', 'Cancellation must require an operational reason');

console.log('POS product reservation lifecycle contract: PASS');
