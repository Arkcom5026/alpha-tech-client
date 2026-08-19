import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sale customer create modal UX contract', () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const customerBase = path.join(root, 'src/features/sales/create/customer');
  const shellPath = path.join(customerBase, 'SaleCustomerSection.jsx');
  const dialogPath = path.join(customerBase, 'components/SaleCustomerCreateDialog.jsx');
  const detailsPath = path.join(customerBase, 'components/SaleCustomerDetailsForm.jsx');
  const indexPath = path.join(customerBase, 'index.js');

  const read = (filePath) => fs.readFileSync(filePath, 'utf8');
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };

  [shellPath, dialogPath, detailsPath, indexPath].forEach((filePath) => {
    assert(fs.existsSync(filePath), `${path.basename(filePath)} must exist`);
  });

  const shell = read(shellPath);
  const dialog = read(dialogPath);
  const details = read(detailsPath);
  const index = read(indexPath);

  assert(shell.includes('customerCreateDialogOpen'), 'Sale shell must own create dialog visibility state');
  assert(shell.includes('<SaleCustomerCreateDialog'), 'Sale shell must render the customer create dialog');
  assert(shell.includes('เพิ่มลูกค้าใหม่'), 'Search miss state must offer an explicit add-customer action');
  assert(shell.includes('setPendingCreate(true)'), 'Search miss must preserve a pending create candidate');
  assert(shell.includes('setCustomerCreateDialogOpen(false)'), 'Search miss and selection transitions must keep the dialog controlled');
  assert(!shell.includes("setFormInfo('ไม่พบลูกค้าในร้านนี้ สามารถเพิ่มข้อมูลลูกค้าใหม่ได้')"), 'Search miss must not expand the legacy inline create notice');
  assert(!shell.includes('|| view.selection.pendingCreate ? (\n        <SaleCustomerDetailsForm'), 'Pending create must not render the details form inline');
  assert(shell.includes('setTimeout(() => document.getElementById(\'customer-name-input\')?.focus(), 80)'), 'Opening the create dialog must focus the prefilled customer name field');
  assert(shell.includes('setCustomerCreateDialogOpen(false);\n    setFormError(\'\');'), 'Cancelling create must close the dialog without clearing sale state');
  assert(!shell.includes('handleCancelCreate = () => {\n    if (customerMutationRef.current) return;\n    setPendingCreate(false)'), 'Cancelling the dialog must not discard the search-miss candidate');
  assert(!shell.includes('handleCancelCreate = () => {\n    if (customerMutationRef.current) return;\n    search.clearSearch()'), 'Cancelling the dialog must not clear the customer search');

  assert(dialog.includes("from '@/components/ui/dialog'"), 'Customer create UX must use the shared dialog primitive');
  assert(dialog.includes('<SaleCustomerDetailsForm'), 'Dialog must reuse the existing customer details form');
  assert(dialog.includes('max-h-[92vh]'), 'Dialog must stay usable on shorter POS viewports');
  assert(dialog.includes('formError'), 'Create validation errors must be visible inside the dialog');
  assert(details.includes('AddressForm'), 'Dialog reuse must retain the existing address authority');
  assert(index.includes('SaleCustomerCreateDialog'), 'Customer feature boundary must export the reusable create dialog');

  console.log('Sale customer create modal UX contract: PASS');
});
