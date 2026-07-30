import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const api = read('src/features/partnerStoreApplication/api/partnerStoreApplicationApi.js');
const apply = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationPage.jsx');
const review = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
const router = read('src/routes/AppRouter.jsx');
const superadmin = read('src/routes/superadmin/superAdminRoutes.jsx');

assert.ok(api.includes("'/public/partner-store-applications'"));
assert.ok(api.includes("'/partner-store/applications'"));
assert.ok(api.includes('/approve'));
assert.ok(api.includes('/reject'));
assert.ok(apply.includes('businessAddress'));
assert.ok(apply.includes('contactPhone'));
assert.ok(apply.includes('Application received'));
assert.ok(review.includes('Owner User ID'));
assert.ok(review.includes('อนุมัติ'));
assert.ok(review.includes('ปฏิเสธ'));
assert.ok(router.includes("'partner-portal/apply'"));
assert.ok(superadmin.includes("'partner-store-applications'"));
assert.ok(!apply.includes("'/auth/register'"));

console.log('partner store application UI contract: PASS');
