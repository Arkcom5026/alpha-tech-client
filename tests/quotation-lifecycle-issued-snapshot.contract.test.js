const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const api = read('src/features/quotation/api/quotationApi.js');
const printPage = read('src/features/quotation/pages/QuotationPrintPage.jsx');

for (const token of [
  'const hydrateIssuedSnapshot = (quotation) => {',
  "quotation.status === 'DRAFT' || !snapshot",
  'documentHeaderSnapshot: snapshot.documentHeader',
  'items: Array.isArray(snapshot.items) ? snapshot.items : quotation.items',
  'customerAddress: customer.address',
  'grandTotal: totals.grandTotal',
]) {
  if (!api.includes(token)) throw new Error(`Issued snapshot hydration contract missing: ${token}`);
}

for (const token of [
  'issueQuotation',
  'acceptQuotation',
  'rejectQuotation',
  'cancelQuotation',
  "quotation?.status === 'DRAFT'",
  "runLifecycle('issue')",
  "runLifecycle('accept')",
  "runLifecycle('reject')",
  "runLifecycle('cancel')",
  'หลังออกเอกสารแล้วข้อมูลและรายการจะถูกล็อกเป็น snapshot และแก้ไขไม่ได้',
]) {
  if (!printPage.includes(token)) throw new Error(`Quotation lifecycle workspace contract missing: ${token}`);
}

if (!printPage.includes("const editable = quotation?.status === 'DRAFT';")) {
  throw new Error('Document line editing must remain draft-only after issue');
}
if (!printPage.includes("{editable ? <th")) {
  throw new Error('Document edit action column must disappear after issue');
}
if (!printPage.includes("{editable ? <React.Fragment>")) {
  throw new Error('Document add-line action must disappear after issue');
}

console.log('Quotation Lifecycle Issued Snapshot Contract: PASS');
