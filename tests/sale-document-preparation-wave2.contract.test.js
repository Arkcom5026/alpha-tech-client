const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const api = read('src', 'features', 'sales', 'documents', 'preparation', 'api', 'saleDocumentPreparationApi.js');
const hook = read('src', 'features', 'sales', 'documents', 'preparation', 'hooks', 'useSaleDocumentPreparation.js');
const adapter = read('src', 'features', 'sales', 'documents', 'preparation', 'adapters', 'saleDocumentPreparationAdapter.js');
const panel = read('src', 'features', 'deliveryNote', 'components', 'workspace', 'DeliveryNotePreparationPanel.jsx');
const page = read('src', 'features', 'deliveryNote', 'pages', 'PrintDeliveryNotePage.jsx');

const mustContain = (source, value, label) => {
  if (!source.includes(value)) throw new Error(`${label}: missing ${value}`);
};
const mustNotContain = (source, value, label) => {
  if (source.includes(value)) throw new Error(`${label}: forbidden ${value}`);
};

mustContain(api, '`/sales/${saleId}/document-preparation`', 'preparation api');
mustContain(api, '`/sales/${saleId}/document-preparation/lines`', 'preparation api');
mustContain(api, 'if (Number(error?.response?.status) === 404) return null', 'preparation api compatibility');

mustContain(hook, 'createSaleDocumentPreparation', 'preparation hook');
mustContain(hook, 'replaceSaleDocumentPreparationLines', 'preparation hook');
mustContain(hook, 'setPreparation(next)', 'preparation hook');

mustContain(adapter, 'buildPreparationSeedLines', 'preparation adapter');
mustContain(adapter, 'buildPreparationPrintableItems', 'preparation adapter');
for (const forbidden of ['productId:', 'stockItemId:', 'simpleLotId:', 'saleItemIds:', 'simpleItemIds:']) {
  mustNotContain(adapter, forbidden, 'preparation adapter');
}

mustContain(panel, 'จัดเตรียมรายการเอกสารสำหรับหน่วยงาน', 'preparation panel');
mustContain(panel, 'คัดลอกรายการขายเป็นจุดเริ่มต้น', 'preparation panel');
mustContain(panel, '+ เพิ่มรายการ', 'preparation panel');
mustContain(panel, 'ยอดธุรกรรมจริง', 'preparation panel');
mustContain(panel, 'ยอดเอกสารหน่วยงาน', 'preparation panel');
mustContain(panel, 'ยอดนอกงบประมาณ', 'preparation panel');
mustContain(panel, 'บันทึกแบบร่าง', 'preparation panel');
mustNotContain(panel, 'Rev.', 'single draft panel');
mustNotContain(panel, 'revision', 'single draft panel');

mustContain(page, 'useSaleDocumentPreparation', 'delivery note page');
mustContain(page, 'buildPreparationPrintableItems(preparation)', 'delivery note page');
mustContain(page, 'const legacyEditorEnabled = !isConsolidated && !preparation', 'delivery note page');
mustContain(page, 'editableDocumentLines={legacyEditorEnabled}', 'delivery note page');
mustContain(page, '<DeliveryNotePreparationPanel', 'delivery note page');

console.log('Sale document preparation Wave 2 contract: PASS');
