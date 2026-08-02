const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const store = read('src/features/repair/store/repairRuntimeStore.js');
const page = read('src/features/repair/pages/RepairJobsPage.jsx');
const board = read('src/features/repair/components/QueueBoard.jsx');

assert(store.includes('repairSummary: emptyRepairSummary'), 'Store must keep repair summary state');
assert(store.includes('payload?.summary || emptyRepairSummary'), 'Store must consume server summary');
assert(store.includes('payload?.items || []'), 'Store must consume server items envelope');
assert(page.includes('Repair Control Center'), 'Jobs page must present control center');
assert(page.includes('repairSummary?.[key] || 0'), 'Summary cards must render server summary');
assert(page.includes("['overdue', 'เกิน SLA']"), 'Overdue metric must be visible');
assert(page.includes("['intakeIncomplete', 'หลักฐานรับเครื่องไม่ครบ']"), 'Incomplete intake metric must be visible');
assert(board.includes('item.operational'), 'Queue cards must consume server operational projection');
assert(board.includes('EXCEPTION_LABELS'), 'Exception labels must exist');
assert(board.includes("exception === 'SLA_OVERDUE'"), 'Overdue exception must be emphasized');
assert(board.includes('operational.ageHours'), 'Queue cards must show status age');
assert(!page.includes('Date.now()'), 'Client must not calculate SLA authority');
assert(!board.includes('Date.now()'), 'Queue cards must not calculate SLA authority');

console.log('Repair control center SLA client contract: PASS');
