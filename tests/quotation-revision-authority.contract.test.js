import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const includes = (source, token, message) => {
  if (!source.includes(token)) throw new Error(message || `Expected token: ${token}`);
};

const api = read('src/features/quotation/api/quotationApi.js');
const printPage = read('src/features/quotation/pages/QuotationPrintPage.jsx');
const listPage = read('src/features/quotation/pages/QuotationListPage.jsx');

for (const token of [
  'export const getQuotationRevisionHistory',
  'export const createQuotationRevision',
  "apiClient.get(`/sales/quotations/${quotationId}/revisions`)",
  "apiClient.post(`/sales/quotations/${quotationId}/revisions`, { note })",
  'revisionNumber: snapshot.revisionNumber',
  'revisionRootId: snapshot.revisionRootId',
  'revisedFromId: snapshot.revisedFromId',
  'const superseded = Boolean(quotation.revisedTo);',
  "status: superseded ? 'SUPERSEDED' : quotation.status",
  'lifecycleStatus: quotation.status',
  'isSuperseded: superseded',
]) includes(api, token, `Quotation revision API contract missing: ${token}`);

for (const token of [
  'getQuotationRevisionHistory',
  'createQuotationRevision',
  "runLifecycle('revision')",
  'สร้างฉบับแก้ไข',
  'ฉบับเดิมจะไม่ถูกแก้ไข',
  'data-testid="quotation-revision-history"',
  'ประวัติ Revision:',
  'Rev.{revision.revisionNumber}',
  'Revision:</span>',
  'Rev.{revisionNumber}',
  "const editable = quotation?.status === 'DRAFT';",
  "['ISSUED', 'ACCEPTED'].includes(quotation.status)",
]) includes(printPage, token, `Quotation revision workspace contract missing: ${token}`);

for (const token of [
  '<th className="px-4 py-3">Revision</th>',
  'Rev.{Number(row.revisionNumber || 0)}',
  'เอกสารที่ออกแล้วคง immutable และสร้าง Revision ใหม่ได้',
]) includes(listPage, token, `Quotation list revision identity missing: ${token}`);

console.log('Quotation Revision Authority Client Contract: PASS');
