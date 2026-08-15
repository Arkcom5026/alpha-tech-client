import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const createSource = read('src/features/customerReceipt/pages/CreateCustomerReceiptPage.jsx');
const allocationSource = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationBody.jsx');
const cancelSource = read('src/features/customerReceipt/components/CustomerReceiptCancelSection.jsx');

for (const [name, source] of [
  ['customer receipt create', createSource],
  ['customer receipt allocation', allocationSource],
  ['customer receipt cancellation', cancelSource],
]) {
  assert(source.includes('feedback.actionSuccess'), `${name} must provide action success feedback`);
  assert(source.includes('feedback.actionError'), `${name} must provide action error feedback`);
}

assert(createSource.includes('if (submitting) return'), 'Customer receipt create must block duplicate submits');
assert(allocationSource.includes('if (submitting) return null'), 'Customer receipt allocation wrapper must block duplicate submits');
assert(cancelSource.includes('if (submitting) return'), 'Customer receipt cancellation must block duplicate submits');
assert(cancelSource.includes('cancelReason.trim()'), 'Customer receipt cancellation must require an explicit reason');

console.log('Customer Receipt Action Feedback Hardening Contract: PASS');
