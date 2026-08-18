import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const css = read('src/index.css');
const document = read('src/features/bill/components/FullTaxA4Document.jsx');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  document.includes('const MAX_ROWS_LAST_PAGE = 20;'),
  'Full-tax last-page table must retain the fuller 20-row presentation.'
);

assert(
  css.includes('.full-tax-a4-page table {')
    && css.includes('font-size: 13px !important;')
    && css.includes('width: 45% !important;')
    && css.includes('width: 49% !important;')
    && css.includes('width: 14% !important;'),
  'Full-tax table typography and column balance must strongly favor DESCRIPTION while keeping monetary columns compact.'
);

assert(
  document.includes('full-tax-editor-column')
    && css.includes('.full-tax-a4-page table .full-tax-editor-column')
    && css.includes('width: 4% !important;'),
  'The editor affordance must keep a narrow screen-only column without consuming document space.'
);

assert(
  css.includes('body .full-tax-a4-page')
    && css.includes('border: 0.3mm solid #444 !important;')
    && document.includes('border-radius: 2.5mm !important;'),
  'Printed full-tax sheets must retain the large rounded outer document frame inside the print-safe content box.'
);

console.log('Full Tax Document Presentation Polish Contract: PASS');
