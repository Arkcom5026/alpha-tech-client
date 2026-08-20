import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const api = read('src', 'features', 'sales', 'documents', 'preparation', 'api', 'saleDocumentPreparationApi.js');
const hook = read('src', 'features', 'sales', 'documents', 'preparation', 'hooks', 'useSaleDocumentPreparation.js');
const panel = read('src', 'features', 'deliveryNote', 'components', 'workspace', 'DeliveryNotePreparationPanel.jsx');
const page = read('src', 'features', 'deliveryNote', 'pages', 'PrintDeliveryNotePage.jsx');

const requireText = (source, text, label) => {
  if (!source.includes(text)) throw new Error(`${label}: missing ${text}`);
};

requireText(api, '`/sales/${saleId}/document-preparation/lock`', 'lock api');
requireText(hook, 'lockSaleDocumentPreparation', 'lock hook');
requireText(hook, 'ยืนยันแบบร่างเอกสารแล้ว', 'lock feedback');
requireText(panel, "const isLocked = preparation?.status === 'LOCKED'", 'locked panel');
requireText(panel, 'readOnly={isLocked}', 'locked panel fields');
requireText(panel, 'แบบร่างถูกล็อกแล้ว และไม่สามารถแก้รายการเดิมได้', 'locked panel message');
requireText(panel, 'ยืนยันแบบร่าง', 'lock action');
requireText(page, 'onLock={preparationActions.lock}', 'delivery note lock wiring');

if (panel.includes('Rev.')) throw new Error('locked preparation must remain single-draft without revision UI');
if (panel.includes('สร้าง Revision')) throw new Error('locked preparation must not expose revision creation');

console.log('Sale document preparation Wave 3 client contract: PASS');
