import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const capability = read('src/features/printing/presentation/presentationCapabilityRegistry.js');
const resolver = read('src/features/printing/presentation/financeOperationalPresentation.js');
const footer = read('src/features/printing/presentation/FinanceOperationalPresentationFooter.jsx');
const receiptResolver = read('src/features/customerMoneyReceive/presentation/customerMoneyReceiptPresentation.js');
const receiptPrint = read('src/features/customerMoneyReceive/pages/CustomerMoneyReceiptPrintPage.jsx');
const settlementResolver = read('src/features/customerMoneySettlement/presentation/deliveryCreditSettlementPresentation.js');
const settlementPrint = read('src/features/customerMoneySettlement/pages/DeliveryCreditSettlementPrintPage.jsx');
const settingsCard = read('src/features/settings/components/FinanceOperationalPresentationSettingsCard.jsx');
const settingsPage = read('src/features/settings/pages/DocumentFormatSettingsPage.jsx');

for (const code of ['CUSTOMER_MONEY_RECEIPT', 'DELIVERY_CREDIT_SETTLEMENT', 'REFUND_RECEIPT']) {
  assert(capability.includes(`${code}: FINANCE_MIXED`), `${code} must use the shared finance-operational profile.`);
}

assert(capability.includes("protectedBlocks: ['DOCUMENT_META', 'PARTY', 'TOTALS', 'SYSTEM_NOTICE']"), 'SYSTEM_NOTICE must remain protected.');
assert(!capability.includes("storeBlocks: ['STORE_HEADER', 'NOTES', 'SIGNATURES', 'SYSTEM_NOTICE'"), 'Store settings must never own SYSTEM_NOTICE.');
assert(resolver.includes("blockContent(presentation, 'NOTES')"));
assert(resolver.includes("blockContent(presentation, 'CUSTOM_FOOTER')"));
assert(footer.includes('finance-operational-system-notice'));
assert(footer.includes('finance-operational-custom-footer'));
assert(footer.includes('systemNotices = []'));

assert(receiptResolver.includes("const DOCUMENT_PURPOSE = 'CUSTOMER_MONEY_RECEIPT'"));
assert(receiptResolver.includes("record?.presentationSnapshots?.[rendererFamily]"));
assert(receiptResolver.includes('presentationSnapshot?.businessSnapshot?.storeIdentity'));
assert(receiptResolver.includes('buildStoreDocumentHeader'));
assert(receiptPrint.includes('resolveCustomerMoneyReceiptPresentation'));
assert(receiptPrint.includes('buildCustomerMoneyReceiptHeader'));
assert(receiptPrint.includes('FinanceOperationalPresentationFooter'));
assert(receiptPrint.includes('ไม่ใช่ใบกำกับภาษี และไม่ก่อให้เกิดการตัดสต๊อกหรือรายการภาษีจากการรับเงินนี้'));

assert(settlementResolver.includes("const DOCUMENT_PURPOSE = 'DELIVERY_CREDIT_SETTLEMENT'"));
assert(settlementResolver.includes('record?.presentationSnapshots?.[rendererFamily]'));
assert(settlementResolver.includes('presentationSnapshot?.businessSnapshot?.storeIdentity'));
assert(settlementPrint.includes('resolveDeliveryCreditSettlementPresentation'));
assert(settlementPrint.includes('buildDeliveryCreditSettlementHeader'));
assert(settlementPrint.includes('FinanceOperationalPresentationFooter'));
assert(settlementPrint.includes('ไม่สร้าง stock movement และไม่ตัดสต๊อกซ้ำ'));

assert(settingsCard.includes('ข้อความระบบด้านล่างเป็นข้อมูล authority ของเอกสาร'));
assert(settingsCard.includes('SYSTEM_NOTICE') === false, 'settings UI must not write protected SYSTEM_NOTICE content.');
assert(settingsPage.includes('FinanceOperationalPresentationSettingsCard'));
assert(settingsPage.includes('documentPurpose="CUSTOMER_MONEY_RECEIPT"'));
assert(settingsPage.includes('ใบรับเงิน Customer Money'));
assert(settingsPage.includes('documentPurpose="DELIVERY_CREDIT_SETTLEMENT"'), 'Delivery Credit Settlement must be configurable in the single document design center.');

console.log('Finance Operational Document Presentation Wave 5 Contract: PASS');
