import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};
const assertBefore = (source, first, second, message) => {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0 || firstIndex >= secondIndex) throw new Error(message);
};

const dashboard = read('src/features/finance/pages/FinanceDashboardPage.jsx');
const header = read('src/features/finance/components/workspace/FinanceWorkspaceHeader.jsx');
const metric = read('src/features/finance/components/workspace/FinanceMetricCard.jsx');
const action = read('src/features/finance/components/workspace/FinanceActionCard.jsx');
const section = read('src/features/finance/components/workspace/FinanceWorkspaceSection.jsx');
const ar = read('src/features/finance/pages/AccountsReceivablePage.jsx');
const credit = read('src/features/finance/pages/CustomerCreditPage.jsx');
const closing = read('src/features/finance/pages/DailyClosingPage.jsx');

assertIncludes(dashboard, 'FinanceWorkspaceHeader', 'Finance dashboard must use the workspace header');
assertIncludes(dashboard, 'FinanceMetricCard', 'Finance dashboard must compose metric cards');
assertIncludes(dashboard, 'FinanceWorkspaceSection', 'Finance dashboard must use workspace sections');
assertIncludes(dashboard, 'FinanceActionCard', 'Finance dashboard must use focused navigation actions');
assertBefore(dashboard, '<FinanceWorkspaceHeader', '<FinanceWorkspaceSection', 'Workspace header must appear before finance actions');
assertIncludes(dashboard, '`/${shopSlug}/pos/finance/ar`', 'Accounts receivable route authority must remain unchanged');
assertIncludes(dashboard, '`/${shopSlug}/pos/finance/customer-credit`', 'Customer credit route authority must remain unchanged');
assertIncludes(dashboard, '`/${shopSlug}/pos/finance/supplier-payables`', 'Supplier payables route authority must remain unchanged');

assertIncludes(header, 'bg-teal-50', 'Finance workspace identity must use the system teal authority');
assertIncludes(header, 'min-h-11', 'Finance workspace badge/action surface must remain touch sized');
assertIncludes(action, 'min-h-24', 'Finance action cards must remain comfortably touch sized');
assertIncludes(action, 'focus:ring-2', 'Finance action cards must preserve visible keyboard focus');
assertIncludes(metric, 'TONES', 'Finance metrics must use one deterministic tone authority');
assertIncludes(section, 'rounded-3xl', 'Finance workspace sections must preserve the shared composition shell');

for (const [name, source] of [['AR', ar], ['Customer Credit', credit], ['Daily Closing', closing]]) {
  assertIncludes(source, 'FinanceWorkspaceHeader', `${name} must use the finance workspace header`);
  assertIncludes(source, 'FinanceMetricCard', `${name} must use shared finance metric cards`);
  assertIncludes(source, 'FinanceWorkspaceSection', `${name} must use shared finance workspace sections`);
  assertIncludes(source, 'min-h-11', `${name} controls must remain touch sized`);
  assertIncludes(source, 'bg-teal-700', `${name} primary action must use system teal`);
}

assertIncludes(ar, 'type="search"', 'AR keyword input must expose search semantics');
assertIncludes(ar, 'role="alert"', 'AR error feedback must be accessible');
assertIncludes(ar, 'role="status"', 'AR wiring feedback must be accessible');
assertIncludes(ar, 'buildParams', 'AR filter parameter authority must remain explicit');
assertIncludes(ar, 'fetchAccountsReceivableAction', 'AR combined fetch authority must remain available');
assertIncludes(ar, 'fetchAccountsReceivableSummaryAction', 'AR summary fallback authority must remain available');
assertIncludes(ar, 'fetchAccountsReceivableRowsAction', 'AR row fallback authority must remain available');
assertIncludes(ar, 'Math.max(0', 'AR outstanding calculation must never become negative');
assertIncludes(ar, 'onClearFilters', 'AR clear-filter behavior must remain available');

assertIncludes(credit, 'useSyncExternalStore', 'Customer credit hard-stable store subscription must remain intact');
assertIncludes(credit, 'getDefaultRange90', 'Customer credit default 90-day range must remain intact');
assertIncludes(credit, 'fetchCustomerCreditAction', 'Customer credit combined fetch authority must remain available');
assertIncludes(credit, 'fetchCustomerCreditSummaryAction', 'Customer credit summary fallback must remain available');
assertIncludes(credit, 'fetchCustomerCreditRowsAction', 'Customer credit rows fallback must remain available');
assertIncludes(credit, 'ไม่ auto-load', 'Customer credit must preserve explicit-load behavior');
assertIncludes(credit, 'type="search"', 'Customer credit keyword input must expose search semantics');

assertIncludes(closing, 'totalCollected', 'Daily closing collection derivation must remain explicit');
assertIncludes(closing, 'creditOutstandingAmount', 'Daily closing credit separation must remain explicit');
assertIncludes(closing, 'expectedCashAmount', 'Daily closing expected cash authority must remain explicit');
assertIncludes(closing, 'differenceAmount', 'Daily closing difference calculation must remain explicit');
assertIncludes(closing, "status === 'BALANCED'", 'Daily closing balanced status behavior must remain explicit');
assertIncludes(closing, 'onUseSingleDay', 'Daily closing single-day convenience behavior must remain available');
assertIncludes(closing, 'Runtime Truth:', 'Daily closing must preserve its source-of-truth explanation');
assertIncludes(closing, 'role="alert"', 'Daily closing error feedback must be accessible');

console.log('Finance workspace standard contract: PASS');
