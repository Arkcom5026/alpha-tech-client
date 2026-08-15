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
  ['product create runtime', 'src/features/product/create/hooks/useProductCreateRuntimeController.js'],
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

  // Wave 2: owners that were outside the original curated audit.
  ['product profile create', 'src/features/productProfile/pages/CreateProductProfilePage.jsx'],
  ['product profile edit', 'src/features/productProfile/pages/EditProductProfilePage.jsx'],
  ['product profile list', 'src/features/productProfile/pages/ListProductProfilePage.jsx'],
  ['sales tax filing', 'src/features/tax/outputFilings/pages/SalesTaxFilingPage.jsx'],
  ['tax publication retry', 'src/features/tax/publicationRetry/pages/TaxPublicationRetryPage.jsx'],
  ['partner store governance', 'src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx'],
  ['supplier advance payment', 'src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx'],
  ['supplier receipt payment', 'src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx'],
  ['printer settings', 'src/features/printing/settings/PrinterSettingsPanel.jsx'],
  ['server printer settings', 'src/features/printing/settings/ServerPrinterSettingsPanel.jsx'],
  ['tax issuer profile', 'src/features/tax/issuerProfile/pages/TaxIssuerProfilePage.jsx'],
  ['partner profile', 'src/features/settings/pages/PartnerProfilePage.jsx'],

  // Wave 3: indirect store/action owners missed by direct apiClient discovery.
  ['product reservation lifecycle', 'src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx'],
  ['combined billing document', 'src/features/combinedBilling/pages/CombinedBillingPage.jsx'],
  ['admin branch lifecycle', 'src/features/admin/components/FormBranch.jsx'],

  // Wave 4: destructive residual owners that previously relied on browser prompts.
  ['held cart lifecycle', 'src/features/sales/held-cart/components/PosHeldCartPanel.jsx'],
  ['customer money receive cancellation', 'src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx'],
].map(([name, file]) => [name, file, read(file)]);

assert(feedbackSource.includes('actionSuccess:'), 'feedback authority must expose actionSuccess');
assert(feedbackSource.includes('actionError:'), 'feedback authority must expose actionError');
assert(errorSource.includes('error?.response?.data?.error?.message'), 'error normalization must support Server operational envelope');

for (const [name, file, source] of actionOwners) {
  assert(source.includes('feedback.actionSuccess'), `${name} (${file}) must provide persistent action success feedback`);
  assert(source.includes('feedback.actionError'), `${name} (${file}) must provide persistent action error feedback`);
}

const productEditSource = read('src/features/product/pages/EditProductPage.jsx');
assert(productEditSource.includes('if (isUpdating) return'), 'Product edit must block duplicate submits while saving');
assert(productEditSource.includes("feedback.actionSuccess('บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว'"), 'Product edit must show visible save success feedback');
assert(!productEditSource.includes("setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล')"), 'Product edit save failure must not replace the entire page with a fatal load error');

const productReservationSource = read('src/features/productReservation/merchant/pages/ProductReservationDetailPage.jsx');
assert(productReservationSource.includes('if (submittingCommand) return'), 'Product reservation lifecycle must block duplicate commands');
assert(productReservationSource.includes('idempotencyKey: createIdempotencyKey'), 'Product reservation lifecycle must retain idempotency protection');

const combinedBillingSource = read('src/features/combinedBilling/pages/CombinedBillingPage.jsx');
assert(combinedBillingSource.includes('if (loading || !customer?.id || !chosen.length) return'), 'Combined billing confirmation must block duplicate or invalid submits');

const adminBranchSource = read('src/features/admin/components/FormBranch.jsx');
assert(adminBranchSource.includes('ConfirmActionDialog'), 'Admin branch deletion must require confirmation');
assert(adminBranchSource.includes('if (isSaving) return'), 'Admin branch creation must block duplicate submits');
assert(adminBranchSource.includes('if (!pendingDeleteBranch || deletingId) return'), 'Admin branch deletion must block duplicate submits');

const heldCartSource = read('src/features/sales/held-cart/components/PosHeldCartPanel.jsx');
assert(!heldCartSource.includes('window.prompt('), 'Held cart cancellation must not use browser prompt');
assert(heldCartSource.includes('pendingCancelId'), 'Held cart cancellation must require an in-context confirmation state');
assert(heldCartSource.includes('if (cancellingId) return'), 'Held cart cancellation must block duplicate destructive submits');

const moneyReceiveSource = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiveDetailPage.jsx');
assert(!moneyReceiveSource.includes('window.prompt('), 'Customer money receive cancellation must not use browser prompt');
assert(moneyReceiveSource.includes('cancelOpen'), 'Customer money receive cancellation must expose an explicit confirmation state');
assert(moneyReceiveSource.includes('if (cancelling) return'), 'Customer money receive cancellation must block duplicate destructive submits');

// Structural regression: the profiles list route previously resolved to a copy of the edit page.
const productProfileListSource = read('src/features/productProfile/pages/ListProductProfilePage.jsx');
const stockRoutesSource = read('src/routes/partner/stockRoutes.jsx');
assert(productProfileListSource.includes('const ListProductProfilePage'), 'Product Profile list must own a ListProductProfilePage component');
assert(!productProfileListSource.includes('const EditProductProfilePage'), 'Product Profile list must not duplicate the edit workspace');
assert(stockRoutesSource.includes('element: <ListProductProfilePage />'), 'Product Profile profiles route must render the list workspace');
assert(productProfileListSource.includes('ConfirmActionDialog'), 'Product Profile delete must require confirmation');

// High-impact / financial actions must retain duplicate-submit protection and confirmation boundaries.
const advancePaymentSource = read('src/features/supplierPayment/components/SupplierAdvancePaymentForm.jsx');
const receiptPaymentSource = read('src/features/supplierPayment/components/SupplierReceiptPaymentForm.jsx');
const salesTaxFilingSource = read('src/features/tax/outputFilings/pages/SalesTaxFilingPage.jsx');
const partnerReviewSource = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationReviewPage.jsx');
assert(advancePaymentSource.includes('if (submitting) return'), 'Supplier advance payment must block duplicate submits');
assert(receiptPaymentSource.includes('if (submitting) return'), 'Supplier receipt payment must block duplicate submits');
assert(salesTaxFilingSource.includes('ConfirmActionDialog'), 'Sales tax filing submission must require confirmation');
assert(partnerReviewSource.includes('ConfirmActionDialog'), 'Partner Store governance high-impact actions must require confirmation');
assert(partnerReviewSource.includes("activationStatus === 'ACTIVE'"), 'Partner Store governance must preserve activated-owner lifecycle presentation');
assert(partnerReviewSource.includes('Provisioning จะสร้าง Branch และ Capability เท่านั้น ไม่เปิดบัญชีเจ้าของร้าน'), 'Partner Store governance must preserve provisioning/account-separation guidance');

const srcRoot = path.join(root, 'src');
const directToastifyImports = [];
const silentDirectMutationOwners = [];
const DIRECT_MUTATION_RE = /\b(?:apiClient|axios)\s*\.\s*(?:post|put|patch|delete)\s*\(/;
const UI_OWNER_RE = /\/(?:pages|components|workspace|workspaces|hooks)\//;
const TRANSPORT_SEGMENT_RE = /\/(?:api|utils|services|projections)\//;

// Explicit exception: this onboarding owner renders a persistent success credential card and
// an inline error panel in the same workspace, so adding a second toast would duplicate feedback.
const INLINE_FEEDBACK_EXEMPTIONS = new Map([
  ['src/features/auth/components/SubEmployeeManager.jsx', 'persistent success credential card + inline error panel'],
]);

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

    const normalized = `/${relativePath}`;
    const isUiOwner = UI_OWNER_RE.test(normalized) && !TRANSPORT_SEGMENT_RE.test(normalized);
    if (isUiOwner && DIRECT_MUTATION_RE.test(source)) {
      const hasSuccess = source.includes('feedback.actionSuccess') || source.includes('feedback.success');
      const hasError = source.includes('feedback.actionError') || source.includes('feedback.error');
      const explicitlyExempt = source.includes('ACTION_FEEDBACK_EXEMPT') || INLINE_FEEDBACK_EXEMPTIONS.has(relativePath);
      if ((!hasSuccess || !hasError) && !explicitlyExempt) silentDirectMutationOwners.push(relativePath);
    }
  }
};
walk(srcRoot);

assert(
  directToastifyImports.length === 0,
  `features must not import react-toastify directly: ${directToastifyImports.join(', ')}`,
);

assert(
  silentDirectMutationOwners.length === 0,
  `direct persistent UI mutations must expose success and error feedback (or documented inline feedback exemption): ${silentDirectMutationOwners.join(', ')}`,
);

console.log('Action Feedback Standardization Contract: PASS');