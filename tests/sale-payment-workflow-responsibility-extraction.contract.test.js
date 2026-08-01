import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

test('Sale payment workflow responsibility extraction contract', () => {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const missionPath = path.join(root, 'docs/missions/sale-payment-workflow-responsibility-extraction.md');
const contractPath = path.join(root, 'src/features/sales/create/payment/contracts/salePaymentAtomicCutoverContract.js');
const calculationPath = path.join(root, 'src/features/sales/create/payment/services/salePaymentCalculation.js');
const validationPath = path.join(root, 'src/features/sales/create/payment/services/salePaymentValidation.js');
const mapperPath = path.join(root, 'src/features/sales/create/payment/services/salePaymentIntentMapper.js');
const controllerPath = path.join(root, 'src/features/sales/create/payment/controllers/salePaymentConfirmationController.js');
const hookPath = path.join(root, 'src/features/sales/create/payment/hooks/useSalePaymentWorkflow.js');
const completionHookPath = path.join(root, 'src/features/sales/create/completion/hooks/useSaleCompletion.js');
const projectionPath = path.join(root, 'src/features/sales/create/payment/projections/salePaymentWorkflowProjection.js');
const indexPath = path.join(root, 'src/features/sales/create/payment/index.js');
const entrypointPath = path.join(root, 'src/features/sales/create/components/PaymentSection.jsx');

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
  controllerPath,
  hookPath,
  completionHookPath,
  projectionPath,
  indexPath,
  entrypointPath,
].forEach((filePath) => assert(fs.existsSync(filePath), `${filePath} must exist`));

const mission = read(missionPath);
const contract = read(contractPath);
const calculation = read(calculationPath);
const validation = read(validationPath);
const mapper = read(mapperPath);
const controller = read(controllerPath);
const hook = read(hookPath);
const completionHook = read(completionHookPath);
const projection = read(projectionPath);
const index = read(indexPath);
const entrypoint = read(entrypointPath);

[
  'projectSalePaymentCalculation',
  'validateSalePaymentConfirmation',
  'mapSalePaymentIntent',
  'executeSalePaymentConfirmation',
  'useSalePaymentWorkflow',
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

assert(controller.includes('mapSalePaymentIntent'), 'Controller must construct payment intent through mapper');
assert(controller.includes('validateSalePaymentConfirmation'), 'Controller must validate before execution');
assert(controller.indexOf('validateSalePaymentConfirmation') < controller.indexOf('onConfirmSale({'), 'Controller must validate before sale execution');
assert(controller.includes("saleMode === 'CREDIT' ? 'PRINT'"), 'Controller must preserve credit delivery-note mode');
assert(controller.includes("customerType === 'GOVERNMENT'"), 'Controller must preserve government sale type');
assert(controller.includes("return 'DELIVERY_NOTE'"), 'Controller must preserve credit document handoff');
assert(controller.includes("saleOption === 'NONE' ? 'RECEIPT'"), 'Controller must preserve receipt fallback');
assert(controller.includes('printWindow?.close?.()'), 'Controller must close reserved print window on failure');
assert(controller.includes('onSaleConfirmed?.'), 'Controller must coordinate completed-sale handoff');
assert(!controller.includes('useState'), 'Controller must remain framework-independent');
assert(!controller.includes('useCallback'), 'Controller must remain framework-independent');

assert(!hook.includes('useRef(false)'), 'Payment workflow must not own a duplicate confirmation lock');
assert(hook.includes('if (isSubmitting) return null'), 'Payment workflow must respect the completion submission authority');
assert(completionHook.includes('const [isSubmitting, setIsSubmitting] = useState(false)'), 'Completion hook must own submission state');
assert(completionHook.includes('SALE_COMPLETION_ALREADY_SUBMITTING'), 'Completion hook must block duplicate submission');
assert(completionHook.includes('setIsSubmitting(true)'), 'Completion hook must acquire the submission authority');
assert(completionHook.includes('setIsSubmitting(false)'), 'Completion hook must release the submission authority');
assert(hook.includes("useState('')"), 'Workflow hook must own payment error feedback');
assert(hook.includes('useState(false)'), 'Workflow hook must own deposit touched lifecycle');
assert(hook.includes('projectSalePaymentCalculation'), 'Workflow hook must delegate payment calculation');
assert(hook.includes('executeSalePaymentConfirmation'), 'Workflow hook must delegate confirmation execution');
assert(hook.includes('setDepositUsed(Math.min'), 'Workflow hook must own deposit suggestion and cap');
assert(hook.includes("setPaymentAmount?.('CASH', '')"), 'Workflow hook must clear immediate payment when switching to credit');
assert(hook.includes('resetSaleOrderAction?.()'), 'Workflow hook must coordinate sale reset');
assert(hook.includes('clearCustomerAndDeposit?.()'), 'Workflow hook must coordinate customer deposit reset');
assert(hook.includes("onSaleModeChange?.('CASH')"), 'Workflow hook must restore cash mode after success');
assert(hook.includes("onSaleOptionChange?.('NONE')"), 'Workflow hook must reset document option after success');
assert(hook.includes('if (!result?.saleId)'), 'Workflow hook must reject success without canonical saleId');
assert(hook.includes('projectSalePaymentWorkflow'), 'Workflow hook must delegate public projection');

assert(projection.includes('calculation'), 'Projection must expose calculation');
assert(projection.includes('feedback:'), 'Projection must expose payment feedback');
assert(projection.includes('confirmation:'), 'Projection must expose confirmation state and command');
assert(projection.includes('deposit:'), 'Projection must expose deposit command');
assert(projection.includes('saleMode:'), 'Projection must expose sale mode command');
assert(projection.includes('discount:'), 'Projection must expose bill discount command');
assert(!projection.includes('useState'), 'Projection must remain framework-independent');

assert(index.includes('projectSalePaymentCalculation'), 'Calculation must be publicly exported');
assert(index.includes('validateSalePaymentConfirmation'), 'Validation must be publicly exported');
assert(index.includes('mapSalePaymentIntent'), 'Mapper must be publicly exported');
assert(index.includes('executeSalePaymentConfirmation'), 'Controller must be publicly exported');
assert(index.includes('useSalePaymentWorkflow'), 'Workflow hook must be publicly exported');
assert(index.includes('projectSalePaymentWorkflow'), 'Workflow projection must be publicly exported');

assert(entrypoint.includes("from '../payment'"), 'PaymentSection must import the public payment boundary');
assert(entrypoint.includes('useSalePaymentWorkflow'), 'PaymentSection must consume the payment workflow');
assert(entrypoint.includes('payment.calculation'), 'PaymentSection must consume projected calculation');
assert(entrypoint.includes('payment.confirmation.confirm'), 'PaymentSection must delegate confirmation');
assert(entrypoint.includes('payment.deposit.changeUsed'), 'PaymentSection must delegate deposit changes');
assert(entrypoint.includes('payment.saleMode.change'), 'PaymentSection must delegate sale-mode changes');
assert(entrypoint.includes('payment.discount.changeBillDiscount'), 'PaymentSection must delegate bill-discount changes');

[
  'const round2 =',
  'function parseMoney',
  'const totalOriginalPrice =',
  'const totalDiscountOnly =',
  'const safeFinalPrice =',
  'const vatAmount =',
  'const priceBeforeVat =',
  'const calc = useMemo',
  'const handleConfirm = useCallback',
  'const paymentsSnapshot =',
  "if (method === 'CARD') method = 'CREDIT'",
  'submitMultiPaymentAction',
  'updatedPaymentsLegacy',
].forEach((legacyOwner) => {
  assert(!entrypoint.includes(legacyOwner), `${legacyOwner} must be removed from PaymentSection`);
});

assert(!entrypoint.includes('validateSalePaymentConfirmation'), 'PaymentSection must not call validation directly');
assert(!entrypoint.includes('mapSalePaymentIntent'), 'PaymentSection must not map payment intent directly');
assert(!entrypoint.includes('executeSalePaymentConfirmation'), 'PaymentSection must not execute confirmation directly');

assert(
  mission.includes('Runtime PASS and Operational PASS require executable evidence'),
  'Mission must preserve verification gate separation'
);

console.log('Sale payment workflow responsibility extraction contract: PASS');
});
