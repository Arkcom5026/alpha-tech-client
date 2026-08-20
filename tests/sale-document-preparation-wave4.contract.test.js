const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const api = read('src', 'features', 'sales', 'documents', 'preparation', 'api', 'saleDocumentPreparationApi.js');
const hook = read('src', 'features', 'sales', 'documents', 'preparation', 'hooks', 'useSaleDocumentPreparation.js');
const panel = read('src', 'features', 'deliveryNote', 'components', 'workspace', 'DeliveryNotePreparationPanel.jsx');
const page = read('src', 'features', 'deliveryNote', 'pages', 'PrintDeliveryNotePage.jsx');

const requireText = (source, text, label) => {
  if (!source.includes(text)) throw new Error(`${label}: missing ${text}`);
};

requireText(api, 'document-preparation/tax-candidates', 'tax projection api');
requireText(hook, 'projectSaleDocumentPreparationTaxDrafts', 'tax projection hook');
requireText(hook, "preparation?.status !== 'LOCKED'", 'locked-only projection guard');
requireText(hook, 'สร้างร่างใบกำกับภาษีแล้ว', 'tax projection feedback');
requireText(panel, 'สร้างร่างใบกำกับภาษี', 'locked panel action');
requireText(panel, 'ใบกำกับภาษีเต็มรูป', 'full projection display');
requireText(panel, 'ใบกำกับภาษีอย่างย่อ (ค่าบริการ)', 'short service projection display');
requireText(panel, 'การออกเลขจริงดำเนินการต่อใน Tax Intake เดิม', 'tax intake reuse');
requireText(page, 'taxProjectionResult={taxProjectionResult}', 'page tax projection result');
requireText(page, 'onProjectTaxDrafts={preparationActions.projectTaxDrafts}', 'page tax projection action');

if (panel.includes('ออกเลขใบกำกับภาษี')) {
  throw new Error('Preparation panel must not duplicate statutory tax issuance workspace');
}

console.log('Sale document preparation Wave 4 client contract: PASS');
