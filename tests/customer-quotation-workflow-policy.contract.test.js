import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const includes = (source, token) => {
  if (!source.includes(token)) throw new Error(`Missing client customer quotation workflow contract: ${token}`);
};

const editor = read('src/features/sales/create/customer/hooks/useSaleCustomerEditor.js');
const form = read('src/features/sales/create/customer/components/SaleCustomerDetailsForm.jsx');
const hydration = read('src/features/sales/create/customer/hooks/useSaleCustomerHydration.js');
const salePage = read('src/features/sales/create/pages/CreateSalePage.jsx');

for (const token of [
  'quotationWorkflowOverride: null',
  'customer.quotationWorkflowOverride === true || customer.quotationWorkflowOverride === false',
  'quotationWorkflowOverride: editor.quotationWorkflowOverride',
]) includes(editor, token);
for (const token of [
  'กระบวนการใบเสนอราคา',
  '<option value="DEFAULT">ตามประเภทลูกค้า</option>',
  '<option value="ENABLED">ใช้ใบเสนอราคา</option>',
  '<option value="DISABLED">ไม่ใช้ใบเสนอราคา</option>',
  "const quotationDefaultEnabled = editor.customerType === 'GOVERNMENT';",
  'quotationWorkflowOverride: workflowOverrideFromValue(event.target.value)',
]) includes(form, token);
for (const token of [
  '...baseCustomer,',
  'useCustomerDepositStore.getState().setSelectedCustomer(fullCustomer)',
]) includes(hydration, token);
for (const token of [
  'selectedCustomer?.quotationWorkflowEnabled === true',
  'if (!quotationWorkflowEnabled) return () => { alive = false; };',
]) includes(salePage, token);

console.log('Customer Quotation Workflow Policy Client Contract: PASS');
