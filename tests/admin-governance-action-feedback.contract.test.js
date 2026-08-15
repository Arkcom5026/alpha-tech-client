import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const usersSource = read('src/features/admin/components/TableUsers.jsx');
const ordersSource = read('src/features/admin/components/TableOrders.jsx');

for (const [name, source] of [
  ['admin user governance', usersSource],
  ['admin order governance', ordersSource],
]) {
  assert(source.includes('feedback.actionSuccess'), `${name} must provide action success feedback`);
  assert(source.includes('feedback.actionError'), `${name} must provide action error feedback`);
}

assert(usersSource.includes('savingRoleUserId'), 'User role changes must expose a dedicated in-flight guard');
assert(usersSource.includes('if (savingRoleUserId) return'), 'User role changes must block duplicate submits');
assert(usersSource.includes('ConfirmActionDialog'), 'User enable/disable changes must retain confirmation');

assert(ordersSource.includes('if (savingStatus) return'), 'Order status changes must block duplicate submits');
assert(ordersSource.includes("nextStatus === 'Cancelled'"), 'Order cancellation must retain destructive routing');
assert(ordersSource.includes('ConfirmActionDialog'), 'Order cancellation must retain confirmation');

console.log('Admin Governance Action Feedback Contract: PASS');
