import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const sidebar = read('src/config/sidebarFinanceItems.js');
const receiptList = read('src/features/customerReceipt/list/CustomerReceiptListWorkspace.jsx');
const depositList = read('src/features/customerDeposit/pages/ListCustomerDepositPage.jsx');
const routes = read('src/routes/partner/posPartnerRoutes.jsx');

assert.match(sidebar, /ประวัติใบรับชำระเดิม/);
assert.doesNotMatch(sidebar, /ประวัติเงินมัดจำเดิม|finance\/deposit|finance\/refunds|จ่ายเงิน\/Advance Sup/);
assert.doesNotMatch(receiptList, /create-new-receipt-button|onOpenAllocate|สร้างใบรับเงิน/);
assert.match(receiptList, /พิมพ์ย้อนหลังเท่านั้น/);
assert.doesNotMatch(depositList, /deposit\/create|รับเงินมัดจำ/);
assert.match(depositList, /การรับเงินใหม่ให้ใช้เมนูรับเงินจากลูกค้า/);
assert.match(routes, /LegacyCustomerMoneyRedirect target="customer-money-receive\/create"/);
assert.match(routes, /LegacyCustomerMoneyRedirect target="customer-money-settlements\/create"/);

console.log('Legacy customer receipt/deposit retirement contract: PASS');
