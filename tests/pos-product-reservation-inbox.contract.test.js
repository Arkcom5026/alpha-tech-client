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
const inbox = read('src/features/productReservation/merchant/pages/ProductReservationInboxPage.jsx');
const detail = read('src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx');
const routes = read('src/routes/partner/salesRoutes.jsx');

assertIncludes(api, "apiClient.get(`/sales/reservations", 'Inbox must use authenticated merchant reservation API');
assertIncludes(api, 'status', 'Inbox API must support lifecycle status filtering');
assertIncludes(api, 'getMerchantProductReservation', 'Merchant detail API is required');

assertIncludes(inbox, 'Merchant Reservation Workspace', 'POS inbox must identify merchant reservation authority');
assertIncludes(inbox, 'งานที่ต้องจัดการ', 'Inbox must prioritize open operational work');
assertIncludes(inbox, 'ACTIVE', 'Inbox must show new reservations');
assertIncludes(inbox, 'ACCEPTED', 'Inbox must show accepted reservations');
assertIncludes(inbox, 'FULFILLMENT_READY', 'Inbox must show fulfillment-ready reservations');
assertIncludes(inbox, 'reservation.expiresAt', 'Inbox must expose reservation expiry');
assertIncludes(inbox, 'reservation.totalAmount', 'Inbox must expose reservation total');
assertIncludes(inbox, 'reservation.itemCount', 'Inbox must expose line count');
assertIncludes(inbox, 'reservation.totalQuantity', 'Inbox must expose total quantity');
assertIncludes(inbox, '/pos/sales/reservations/${reservation.id}', 'Inbox rows must navigate to merchant detail');

assertIncludes(detail, 'getMerchantProductReservation', 'Detail page must load branch-scoped server authority');
assertIncludes(detail, 'รายการสินค้า', 'Detail foundation must render reservation items');
assertIncludes(detail, 'Increment 2', 'Mutation controls must remain outside Increment 1');

assertIncludes(routes, "path: 'reservations'", 'POS sales route must expose reservation inbox');
assertIncludes(routes, "path: 'reservations/:reservationId'", 'POS sales route must expose reservation detail');
assertIncludes(routes, '<ProductReservationInboxPage />', 'Inbox page must be mounted');
assertIncludes(routes, '<ProductReservationDetailPage />', 'Detail page must be mounted');

console.log('POS product reservation inbox contract: PASS');
