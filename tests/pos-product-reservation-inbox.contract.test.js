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
const assertExcludes = (source, value, message) => {
  if (source.includes(value)) throw new Error(message || `Expected source to exclude: ${value}`);
};

const api = read('src/features/productReservation/merchant/api/productReservationMerchantApi.js');
const inbox = read('src/features/productReservation/merchant/pages/ProductReservationInboxPage.jsx');
const detail = read('src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx');
const hub = read('src/features/productReservation/merchant/pages/OnlineCommerceWorkCenterPage.jsx');
const routes = read('src/routes/partner/salesRoutes.jsx');
const sidebar = read('src/config/sidebarSalesItems.js');

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
assertIncludes(inbox, 'const { shopSlug } = useParams()', 'Inbox must preserve the active shop route context');
assertIncludes(inbox, 'reservationBasePath', 'Inbox must derive the reservation route from shop context');
assertIncludes(inbox, 'to={`${reservationBasePath}/${reservation.id}`}', 'Inbox rows must navigate within the active shop');
assertExcludes(inbox, 'to={`/pos/sales/reservations/${reservation.id}`}', 'Inbox must not drop shopSlug from detail links');

assertIncludes(detail, 'getMerchantProductReservation', 'Detail page must load branch-scoped server authority');
assertIncludes(detail, 'รายการสินค้า', 'Detail foundation must render reservation items');
assertIncludes(detail, 'Timeline ใบจอง', 'Detail foundation must retain lifecycle evidence');

assertIncludes(hub, 'Online Commerce Work Center', 'POS must expose one online-commerce entry center');
assertIncludes(hub, '<ProductReservationInboxPage />', 'ProductReservation must be the primary online work queue');
assertIncludes(hub, '/sales/order-online/legacy', 'Legacy OrderOnline must remain explicitly accessible');
assertIncludes(hub, 'เปิดคำสั่งซื้อระบบเดิม', 'Legacy entry must be clear to POS users');

assertIncludes(routes, "path: 'reservations'", 'POS sales route must expose reservation inbox alias');
assertIncludes(routes, "path: 'reservations/:reservationId'", 'POS sales route must expose reservation detail');
assertIncludes(routes, "path: 'order-online'", 'Familiar POS online entry path must remain available');
assertIncludes(routes, '<OnlineCommerceWorkCenterPage />', 'Familiar online entry must open the unified work center');
assertIncludes(routes, "path: 'order-online/legacy'", 'Legacy OrderOnline list must have an explicit sub-route');
assertIncludes(routes, '<ProductReservationDetailPage />', 'Detail page must be mounted');

assertIncludes(sidebar, 'ใบจองและคำสั่งซื้อออนไลน์', 'Sidebar must expose one unified online-commerce label');
assertIncludes(sidebar, '/sales/order-online/', 'Sidebar must preserve the familiar online entry path');

console.log('POS product reservation inbox contract: PASS');
