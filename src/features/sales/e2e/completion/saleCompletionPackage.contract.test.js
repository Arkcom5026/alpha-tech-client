import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(packageRoot, '..', '..', '..', '..', '..');
const readPackage = (file) => fs.readFileSync(path.join(packageRoot, file), 'utf8');
const readClient = (file) => fs.readFileSync(path.join(clientRoot, file), 'utf8');

const spec = readPackage('saleCompletion.browser.spec.js');
const runner = readPackage('run-browser-e2e.ps1');
const authBootstrap = readClient('src/features/e2e/auth/ensureMerchantAuthState.js');

assert.match(spec, /merchantAuthStatePath/);
assert.match(spec, /POS_SALE_E2E_RESULT_PATH/);
assert.match(spec, /Receipt document handoff lost the merchant session/);
assert.match(spec, /authRedirectObserved: false/);
assert.match(spec, /receiptMode: receiptPage \? 'POPUP' : 'SAME_TAB'/);
assert.doesNotMatch(spec, /page\.goto\([^\n]*\/login/);

assert.match(runner, /provisionSaleCompletionFixture\.js/);
assert.match(runner, /ensureMerchantAuthState\.js/);
assert.match(runner, /saleCompletion\.browser\.spec\.js/);
assert.match(runner, /verifySaleCompletionOutcome\.js/);
assert.match(runner, /POS_SALE_E2E_BRANCH_ID/);
assert.match(runner, /Sale completion Browser \+ Database E2E package: PASS/);
assert.match(authBootstrap, /storageState/);

console.log('Sale completion Browser E2E package contract: PASS');
