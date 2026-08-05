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

const detail = read('src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx');
const bridge = read('src/features/productReservation/merchant/pages/ReservationSaleBridgePage.jsx');
const adapter = read('src/features/productReservation/merchant/adapters/productReservationSaleCartAdapter.js');
const createSale = read('src/features/sales/create/pages/CreateSalePage.jsx');
const workflow = read('src/features/sales/create/hooks/useCreateSaleWorkflow.js');
const projection = read('src/features/sales/create/projections/createSaleWorkflowProjection.js');
const payment = read('src/features/sales/create/components/PaymentSummary.jsx');
const routes = read('src/routes/partner/salesRoutes.jsx');

assertIncludes(detail, "['ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP']", 'Only accepted/ready reservations may enter POS sale');
assertIncludes(detail, 'นำใบจองเข้าสู่หน้าขาย POS', 'Reservation detail must expose POS sale bridge action');
assertIncludes(detail, 'to="sale"', 'Bridge action must remain inside current shop route context');

assertIncludes(bridge, "import CreateSalePage from '@/features/sales/create/pages/CreateSalePage'", 'Bridge must reuse the existing POS Sales Engine');
assertIncludes(bridge, 'createProductReservationSaleCart', 'Bridge must use a dedicated reservation cart adapter');
assertIncludes(bridge, 'getMerchantProductReservation', 'Bridge must re-read branch-scoped reservation authority');
assertIncludes(bridge, 'initialItems={saleCart.lines}', 'Reservation items must hydrate the existing POS cart');
assertIncludes(bridge, 'sourceContext={saleCart.source}', 'POS must retain ProductReservation source authority');
assertIncludes(bridge, 'sourceLocked', 'Reservation-backed cart must be locked against mutation');
assertIncludes(bridge, 'saleExecutionDisabled', 'Sale finalization must remain closed until atomic server authority exists');
assertIncludes(bridge, 'ไม่สร้าง POS Held Cart หรือใบจองซ้ำ', 'Operator must see no-duplicate reservation policy');

for (const token of [
  "sourceType: 'PRODUCT_RESERVATION'",
  'sourceId: Number(reservation.id)',
  'sourceCode: String(reservation.code)',
  'stockItemId',
  'simpleLotId',
  'reservationItemId',
]) assertIncludes(adapter, token, `Missing reservation cart mapping authority: ${token}`);

assertIncludes(workflow, 'initialItems = []', 'Create-sale workflow must accept authoritative initial items');
assertIncludes(workflow, 'initialItems,', 'Cart editor must receive authoritative initial items');
assertIncludes(projection, 'selection: itemSearch.selection', 'Projection must preserve item-search dialog state for normal POS sale');
assertIncludes(projection, 'closeSelection: itemSearch.closeSelection', 'Projection must preserve item-search close command');
assertIncludes(projection, 'selectSearchItem: itemSearch.selectSearchItem', 'Projection must preserve item selection command');
assertIncludes(projection, 'recovery: completion.recovery', 'Projection must preserve sale recovery authority');
assertIncludes(createSale, 'sourceContext = null', 'POS page must expose source context');
assertIncludes(createSale, 'sourceLocked = false', 'POS page must expose cart source lock');
assertIncludes(createSale, 'heldCartDisabled={sourceLocked}', 'Online reservation must not create a duplicate held cart');
assertIncludes(createSale, 'saleExecutionDisabled={saleExecutionDisabled}', 'POS must preserve finalization gate');
assertIncludes(payment, "heldCartDisabled ? 'ใช้ใบจองออนไลน์เดิม' : 'บันทึกการจอง'", 'Held-cart button must acknowledge the existing online reservation');
assertIncludes(payment, "saleExecutionDisabled\n            ? 'รอเชื่อม Finalization'", 'Sale confirmation must remain visibly gated');
assertExcludes(bridge, '<CreateSalePage />', 'Bridge must not mount an unscoped empty POS sale page');

assertIncludes(routes, "path: 'reservations/:reservationId/sale'", 'Sales routes must mount the reservation sale bridge');
assertIncludes(routes, '<ReservationSaleBridgePage />', 'Reservation sale bridge route must use the bridge shell');

console.log('ProductReservation POS sale bridge contract: PASS');
