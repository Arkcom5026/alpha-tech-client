'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const requiredFiles = [
  'src/features/tax/expenses/api/taxExpenseApi.js',
  'src/features/tax/expenses/hooks/useTaxExpenseWorkspaceController.js',
  'src/features/tax/expenses/pages/TaxExpenseWorkspacePage.jsx',
  'src/features/tax/expenses/components/TaxExpenseWorkspaceHeader.jsx',
  'src/features/tax/expenses/components/TaxExpenseForm.jsx',
  'src/features/tax/expenses/components/TaxExpenseList.jsx',
  'src/features/tax/expenses/components/TaxExpenseDetailPanel.jsx',
  'src/features/tax/expenses/presentation/taxExpensePresentation.js',
];

for (const file of requiredFiles) {
  assert.ok(fs.existsSync(path.resolve(__dirname, '..', file)), `Missing Tax Expense feature file: ${file}`);
}

const api = fs.readFileSync(path.resolve(__dirname, '../src/features/tax/expenses/api/taxExpenseApi.js'), 'utf8');
assert.match(api, /\/tax\/expense-categories/);
assert.match(api, /\/tax\/expenses/);
assert.match(api, /requirePositiveId\(branchId, 'branchId'\)/);

const controller = fs.readFileSync(path.resolve(__dirname, '../src/features/tax/expenses/hooks/useTaxExpenseWorkspaceController.js'), 'utf8');
assert.match(controller, /useBranchStore/);
assert.match(controller, /listTaxExpenses/);
assert.match(controller, /recordTaxExpense/);

const routes = fs.readFileSync(path.resolve(__dirname, '../src/routes/partner/posPartnerRoutes.jsx'), 'utf8');
assert.match(routes, /tax-expenses/);
const sidebar = fs.readFileSync(path.resolve(__dirname, '../src/config/sidebarFinanceItems.js'), 'utf8');
assert.match(sidebar, /ค่าใช้จ่ายภาษี/);

console.log('Tax Expense workspace contract: PASS');
