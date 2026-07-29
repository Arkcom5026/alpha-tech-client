import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sales dashboard store extraction contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagePath = path.join(root, 'src/features/sales/history/pages/SalesDashboardPage.jsx');
const indexPath = path.join(root, 'src/features/sales/history/dashboard/index.js');
const hookPath = path.join(root, 'src/features/sales/history/dashboard/hooks/useSalesDashboardWorkflow.js');
const storePath = path.join(root, 'src/features/sales/history/dashboard/store/salesDashboardStore.js');
const datePath = path.join(root, 'src/features/sales/history/dashboard/services/salesDashboardDateRange.js');
const projectionPath = path.join(root, 'src/features/sales/history/dashboard/services/salesDashboardOverviewProjection.js');
const contractPath = path.join(root, 'src/features/sales/history/dashboard/contracts/salesDashboardStoreAtomicCutoverContract.js');
const legacyStorePath = path.join(root, 'src/features/sales/store/salesStore.js');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[pagePath, indexPath, hookPath, storePath, datePath, projectionPath, contractPath, legacyStorePath]
  .forEach((filePath) => assert(fs.existsSync(filePath), `${filePath} must exist`));

const page = read(pagePath);
const index = read(indexPath);
const hook = read(hookPath);
const store = read(storePath);
const dateRange = read(datePath);
const projection = read(projectionPath);
const legacyStore = read(legacyStorePath);

assert(page.includes("from '../dashboard'"), 'Dashboard page must import the dashboard public boundary');
assert(page.includes('useSalesDashboardWorkflow'), 'Dashboard page must consume the workflow hook');
assert(!page.includes("@/features/sales/store/salesStore"), 'Dashboard page must not import the legacy Sales Store');
[
  'fetchSalesDashboardOverviewAction',
  'salesOverviewLoading',
  'salesOverviewError',
  'salesOverviewLastLoadedAt',
  'clearSalesOverviewErrorAction',
  'overviewUI',
].forEach((symbol) => assert(!page.includes(symbol), `${symbol} must be removed from the Dashboard page`));

[
  'dashboard.overview',
  'dashboard.loaded',
  'dashboard.loading',
  'dashboard.error',
  'dashboard.lastLoadedAt',
  'dashboard.health',
  'dashboard.actions.loadOverview',
  'dashboard.actions.loadAll',
].forEach((surface) => assert(page.includes(surface), `${surface} must be consumed by the Dashboard page`));

assert(index.includes('useSalesDashboardStore'), 'Dashboard store must be publicly exported');
assert(index.includes('useSalesDashboardWorkflow'), 'Dashboard workflow must be publicly exported');
assert(store.includes("create((set, get)"), 'Dashboard store must own Zustand state');
assert(store.includes('loadOverview'), 'Dashboard store must own overview loading');
assert(store.includes('projectSalesDashboardOverview'), 'Dashboard store must delegate overview projection');
assert(store.includes('projectSalesDashboardDateRange'), 'Dashboard store must delegate date range projection');
assert(hook.includes('useSalesDashboardStore'), 'Dashboard workflow must consume the dedicated store');
assert(hook.includes('health'), 'Dashboard workflow must project health state');
assert(!projection.includes('zustand'), 'Overview projection must remain framework-independent');
assert(!dateRange.includes('zustand'), 'Date range projection must remain framework-independent');

[
  'fetchSalesDashboardOverviewAction',
  'salesOverviewLoading',
  'salesOverviewError',
  'salesOverviewLastLoadedAt',
  'clearSalesOverviewErrorAction',
].forEach((symbol) => assert(legacyStore.includes(symbol), `${symbol} must remain as compatibility surface`));

console.log('Sales dashboard store extraction contract: PASS');
});
