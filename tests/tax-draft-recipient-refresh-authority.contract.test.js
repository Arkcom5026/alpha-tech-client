import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const api = read('src', 'features', 'tax', 'intake', 'api', 'taxIntakeApi.js');
const hook = read('src', 'features', 'tax', 'intake', 'hooks', 'useTaxIntakeWorkspaceController.js');
const panel = read('src', 'features', 'tax', 'intake', 'components', 'TaxIntakeDocumentDetailPanel.jsx');
const page = read('src', 'features', 'tax', 'intake', 'pages', 'TaxIntakeWorkspacePage.jsx');

const requireText = (source, text, label) => {
  if (!source.includes(text)) throw new Error(`${label}: missing ${text}`);
};

requireText(api, '/recipient/refresh', 'recipient refresh API');
requireText(api, 'refreshDraftTaxRecipient', 'recipient refresh API export');
requireText(hook, 'handleRefreshRecipient', 'recipient refresh hook action');
requireText(hook, 'อัปเดตข้อมูลผู้รับจากลูกค้าล่าสุดแล้ว', 'recipient refresh success feedback');
requireText(panel, 'อัปเดตข้อมูลผู้รับจากลูกค้า', 'recipient refresh button');
requireText(panel, 'disabled={transitioning}', 'recipient refresh concurrency guard');
requireText(page, 'onRefreshRecipient={handleRefreshRecipient}', 'recipient refresh page wiring');
requireText(panel, "document.status === 'DRAFT'", 'draft-only recipient refresh surface');
requireText(panel, "document.documentType === 'OUTPUT_TAX_INVOICE'", 'output-tax-only recipient refresh surface');

console.log('Tax draft recipient refresh client authority contract: PASS');
