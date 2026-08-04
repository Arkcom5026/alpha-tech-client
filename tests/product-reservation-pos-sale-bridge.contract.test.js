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

const detail = read('src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx');
const bridge = read('src/features/productReservation/merchant/pages/ReservationSaleBridgePage.jsx');
const routes = read('src/routes/partner/salesRoutes.jsx');

assertIncludes(detail, "['ACCEPTED', 'FULFILLMENT_READY', 'READY_FOR_PICKUP']", 'Only accepted/ready reservations may enter POS sale');
assertIncludes(detail, 'นำใบจองเข้าสู่หน้าขาย POS', 'Reservation detail must expose POS sale bridge action');
assertIncludes(detail, 'to="sale"', 'Bridge action must remain inside current shop route context');

assertIncludes(bridge, "import CreateSalePage from '@/features/sales/create/pages/CreateSalePage'", 'Bridge must reuse the existing POS Sales Engine');
assertIncludes(bridge, 'getMerchantProductReservation', 'Bridge must re-read branch-scoped reservation authority');
assertIncludes(bridge, 'ALLOWED_BRIDGE_STATUSES', 'Bridge must enforce reservation status gate');
assertIncludes(bridge, '<CreateSalePage />', 'Bridge must render the existing POS sale page, not a duplicate checkout');
assertIncludes(bridge, 'ProductReservation → POS Sale Bridge', 'Bridge source authority must be visible to the operator');
assertIncludes(bridge, 'Source Reservation #', 'Reservation reference must remain visible in POS');

assertIncludes(routes, "path: 'reservations/:reservationId/sale'", 'Sales routes must mount the reservation sale bridge');
assertIncludes(routes, '<ReservationSaleBridgePage />', 'Reservation sale bridge route must use the bridge shell');

console.log('ProductReservation POS sale bridge contract: PASS');
