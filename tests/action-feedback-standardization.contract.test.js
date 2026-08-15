import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const feedbackSource = read('src/design-system/feedback/feedback.js');
const errorSource = read('src/design-system/feedback/errorPresentation.js');
const unitCreate = read('src/features/unit/workspace/CreateUnitWorkspace.jsx');
const unitEdit = read('src/features/unit/workspace/EditUnitWorkspace.jsx');
const unitList = read('src/features/unit/workspace/ListUnitWorkspace.jsx');
const employeeDetail = read('src/features/employee/workspaces/EmployeeDetailWorkspace.jsx');
const employeeEdit = read('src/features/employee/workspaces/EmployeeEditWorkspace.jsx');
const employeeLegacyEdit = read('src/features/employee/workspaces/LegacyEmployeeFormWorkspace.jsx');
const employeeRoles = read('src/features/employee/workspaces/ManageRolesWorkspace.jsx');
const branchPrice = read('src/features/branchPrice/workspace/ManageBranchPriceWorkspace.jsx');

assert(feedbackSource.includes('actionSuccess:'), 'feedback authority must expose actionSuccess');
assert(feedbackSource.includes('actionError:'), 'feedback authority must expose actionError');
assert(errorSource.includes('error?.response?.data?.error?.message'), 'error normalization must support Server operational envelope');

for (const [name, source] of [
  ['unit create', unitCreate],
  ['unit edit', unitEdit],
  ['unit list', unitList],
  ['employee detail', employeeDetail],
  ['employee edit', employeeEdit],
  ['employee legacy edit', employeeLegacyEdit],
  ['employee roles', employeeRoles],
  ['branch price', branchPrice],
]) {
  assert(source.includes('feedback.actionSuccess'), `${name} must provide persistent action success feedback`);
  assert(source.includes('feedback.actionError'), `${name} must provide persistent action error feedback`);
}

const srcRoot = path.join(root, 'src');
const directToastifyImports = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx)$/.test(entry.name)) continue;
    const relativePath = path.relative(root, fullPath).replaceAll('\\', '/');
    const source = fs.readFileSync(fullPath, 'utf8');
    if (source.includes("from 'react-toastify'") || source.includes('from "react-toastify"')) {
      if (!relativePath.startsWith('src/design-system/feedback/')) directToastifyImports.push(relativePath);
    }
  }
};
walk(srcRoot);

assert(
  directToastifyImports.length === 0,
  `features must not import react-toastify directly: ${directToastifyImports.join(', ')}`
);

console.log('Action Feedback Standardization Contract: PASS');
