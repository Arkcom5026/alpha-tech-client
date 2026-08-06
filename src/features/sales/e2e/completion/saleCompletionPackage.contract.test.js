import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const readPackage = (file) => fs.readFileSync(path.join(packageRoot, file), 'utf8');

const spec = readPackage('saleCompletion.browser.spec.js');
const runner = readPackage('run-browser-e2e.ps1');
const authBootstrap = readPackage('ensureSaleMerchantAuthState.js');
const authState = readPackage('saleMerchantAuthState.js');

assert.match(spec, /saleMerchantAuthStatePath/);
assert.match(spec, /POS_SALE_E2E_RESULT_PATH/);
assert.match(spec, /Receipt document handoff lost the Sale session/);
assert.match(spec, /authRedirectObserved: false/);
assert.match(spec, /receiptMode: receiptPage \? 'POPUP' : 'SAME_TAB'/);
assert.match(spec, /getByRole\('button', \{ name: 'ค้นหา', exact: true \}\)\.click\(\)/);
assert.match(spec, /locator\('#customer-name-input'\)\)\.toBeVisible\(\)/);
assert.doesNotMatch(spec, /sale-customer-search-input'\)\.press\('Enter'\)/);
assert.doesNotMatch(spec, /page\.goto\([^\n]*\/login/);
assert.doesNotMatch(spec, /features\/e2e\/auth/);

assert.match(runner, /provisionSaleCompletionFixture\.js/);
assert.match(runner, /ensureSaleMerchantAuthState\.js/);
assert.match(runner, /saleCompletion\.browser\.spec\.js/);
assert.match(runner, /verifySaleCompletionOutcome\.js/);
assert.match(runner, /POS_SALE_E2E_OPERATOR_EMAIL/);
assert.match(runner, /POS_SALE_E2E_OPERATOR_PASSWORD/);
assert.match(runner, /Sale completion Browser \+ Database E2E package: PASS/);
assert.doesNotMatch(runner, /src\/features\/e2e\/auth\/ensureMerchantAuthState\.js/);

assert.match(authBootstrap, /saleMerchantAuthStatePath/);
assert.match(authBootstrap, /POS_SALE_E2E_BRANCH_SLUG/);
assert.match(authBootstrap, /POS_SALE_E2E_OPERATOR_EMAIL/);
assert.match(authBootstrap, /POS_SALE_E2E_OPERATOR_PASSWORD/);
assert.doesNotMatch(authBootstrap, /REPAIR_INTAKE_E2E_/);
assert.doesNotMatch(authBootstrap, /E2E_TEST_USERNAME/);
assert.doesNotMatch(authBootstrap, /E2E_TEST_PASSWORD/);

assert.match(authState, /sale-completion\.json/);
assert.doesNotMatch(authState, /test-shop\.json/);

console.log('Sale completion Browser E2E package contract: PASS');
