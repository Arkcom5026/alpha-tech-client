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

const actionOwners = [
  ['unit create', 'src/features/unit/workspace/CreateUnitWorkspace.jsx'],
  ['unit edit', 'src/features/unit/workspace/EditUnitWorkspace.jsx'],
  ['unit list', 'src/features/unit/workspace/ListUnitWorkspace.jsx'],
  ['brand create', 'src/features/brand/workspace/CreateBrandWorkspace.jsx'],
  ['brand edit', 'src/features/brand/workspace/EditBrandWorkspace.jsx'],
  ['category create', 'src/features/category/workspace/CreateCategoryWorkspace.jsx'],
  ['category edit', 'src/features/category/workspace/EditCategoryWorkspace.jsx'],
  ['category lifecycle', 'src/features/category/components/CategoryTable.jsx'],
  ['position create', 'src/features/position/workspace/CreatePositionWorkspace.jsx'],
  ['position edit', 'src/features/position/workspace/EditPositionWorkspace.jsx'],
  ['position lifecycle', 'src/features/position/workspace/ListPositionWorkspace.jsx'],
  ['product type create', 'src/features/productType/workspace/CreateProductTypeWorkspace.jsx'],
  ['product type edit', 'src/features/productType/workspace/EditProductTypeWorkspace.jsx'],
  ['product type lifecycle', 'src/features/productType/components/ProductTypeTable.jsx'],
  ['product edit', 'src/features/product/pages/EditProductPage.jsx'],
  ['product delete', 'src/features/product/pages/ListProductPage.jsx'],
  ['product template images', 'src/features/productTemplate/components/TemplateImageGalleryPanel.jsx'],
  ['employee detail', 'src/features/employee/workspaces/EmployeeDetailWorkspace.jsx'],
  ['employee edit', 'src/features/employee/workspaces/EmployeeEditWorkspace.jsx'],
  ['employee legacy edit', 'src/features/employee/workspaces/LegacyEmployeeFormWorkspace.jsx'],
  ['employee roles', 'src/features/employee/workspaces/ManageRolesWorkspace.jsx'],
  ['supplier create', 'src/features/supplier/workspace/SupplierCreateWorkspace.jsx'],
  ['supplier edit', 'src/features/supplier/workspace/SupplierEditWorkspace.jsx'],
  ['supplier legacy update', 'src/features/supplier/workspace/SupplierLegacyUpdateWorkspace.jsx'],
  ['customer claim', 'src/features/customer/pages/ListCustomersPage.jsx'],
  ['bank lifecycle', 'src/features/bank/workspace/ListBankWorkspace.jsx'],
  ['branch price', 'src/features/branchPrice/workspace/ManageBranchPriceWorkspace.jsx'],
  ['repair workflow', 'src/features/repair/pages/RepairJobDetailPage.jsx'],
  ['stock audit session', 'src/features/stockAudit/pages/ReadyToSellAuditPage.jsx'],
].map(([name, file]) => [name, read(file)]);

assert(feedbackSource.includes('actionSuccess:'), 'feedback authority must expose actionSuccess');
assert(feedbackSource.includes('actionError:'), 'feedback authority must expose actionError');
assert(errorSource.includes('error?.response?.data?.error?.message'), 'error normalization must support Server operational envelope');

for (const [name, source] of actionOwners) {
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
