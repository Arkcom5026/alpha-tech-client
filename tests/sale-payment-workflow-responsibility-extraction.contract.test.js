const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const missionPath = path.join(root, 'docs/missions/sale-payment-workflow-responsibility-extraction.md');
const contractPath = path.join(root, 'src/features/sales/create/payment/contracts/salePaymentAtomicCutoverContract.js');
const calculationPath = path.join(root, 'src/features/sales/create/payment/services/salePaymentCalculation.js');
const validationPath = path.join(root, 'src/features/sales/create/payment/services/salePaymentValidation.js');
const mapperPath = path.join(root, 'src/features/sales/create/payment/services/salePaymentIntentMapper.js');
const indexPath = path.join(root, 'src/features/sales/create/payment/index.js');

const read = (filePath) => fs.readFileSync(filePath, 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

[
  missionPath,
  contractPath,
  calculationPath,
  validationPath,
  mapperPath,
  indexPath,
].forEach((filePath) => assert(fs.existsSync(filePath), `${filePath} must exist`));

const mission = read(missionPath);
const contract = read(contractPath);
const calculation = read(calculationPath);
const validation = read(validationPath);
const mapper = read(mapperPath);
const index = read(indexPath);

[
  'projectSalePaymentCalculation',
  'validateSalePaymentConfirmation',
  'mapSalePaymentIntent',
  'executeSalePaymentConfirmation',
  'projectSalePaymentWorkflow',
].forEach((symbol) => {
  assert(mission.includes(symbol), `${symbol} must be represented in the mission`);
  assert(contract.includes(symbol), `${symbol} must be represented in the cutover contract`);
});

assert(calculation.includes('totalOriginalPrice'), 'Calculation must project original total');
assert(calculation.includes('totalDiscountOnly'), 'Calculation must project line discounts');
assert(calculation.includes('safeBillDiscount'), 'Calculation must project bill discount');
assert(calculation.includes('vatRate = 7'), 'Calculation must preserve VAT rate');
assert(calculation.includes('remainingToPay'), 'Calculation must project remaining amount');
assert(calculation.includes('changeAmount'), 'Calculation must project change');
assert(calculation.includes('grandTotalPaid'), 'Calculation must project grand paid amount');
assert(!calculation.includes('useMemo'), 'Calculation service must remain framework-independent');

assert(validation.includes("saleMode === 'CASH'"), 'Validation must preserve cash-mode rules');
assert(validation.includes("saleMode === 'CREDIT'"), 'Validation must preserve credit-mode rules');
assert(validation.includes('hasValidCustomerId'), 'Validation must preserve credit customer guard');
assert(validation.includes('hasImmediatePayment'), 'Validation must preserve credit immediate-payment guard');
assert(validation.includes('Payment evidence is required'), 'Validation must require cash payment evidence');
assert(!validation.includes('useState'), 'Validation service must remain framework-independent');

assert(mapper.includes("normalized === 'CARD' ? 'CREDIT'"), 'Mapper must preserve CARD-to-CREDIT contract mapping');
assert(mapper.includes("paymentMethod: 'DEPOSIT'"), 'Mapper must preserve deposit evidence');
assert(mapper.includes('customerDepositId'), 'Mapper must preserve deposit identity');
assert(mapper.includes("method === 'CASH'"), 'Mapper must apply cash change');
assert(mapper.includes('paymentItems'), 'Mapper must return payment intent items');
assert(!mapper.includes('useCallback'), 'Mapper must remain framework-independent');

assert(index.includes('projectSalePaymentCalculation'), 'Calculation must be publicly exported');
assert(index.includes('validateSalePaymentConfirmation'), 'Validation must be publicly exported');
assert(index.includes('mapSalePaymentIntent'), 'Mapper must be publicly exported');

assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sale payment workflow responsibility extraction contract: PASS');
