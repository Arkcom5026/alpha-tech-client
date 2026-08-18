import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const source = fs.readFileSync(path.join(root, 'src/features/quotation/api/quotationApi.js'), 'utf8');

const includes = (value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

includes('PLACEHOLDER_MODEL_DESCRIPTION', 'Quotation API must identify placeholder model descriptions');
includes('รุ่น\\/แบบ:', 'Placeholder-model policy must target generated model-label descriptions');
includes('sanitizeLinePayload(payload)', 'New and edited quotation lines must sanitize placeholder model descriptions before persistence');
includes('sanitizeQuotation(unwrap(await apiClient.get', 'Loaded quotations must suppress legacy placeholder model descriptions');

console.log('Quotation Placeholder Model Description Contract: PASS');
