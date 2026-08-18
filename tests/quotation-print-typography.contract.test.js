import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const source = fs.readFileSync(path.join(root, 'src/features/quotation/pages/QuotationPrintPage.jsx'), 'utf8');

const includes = (value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};

includes('.quotation-document-header > div:first-child > div:last-child { font-size: 12px !important; }', 'Quotation company identity text must remain readable in print');
includes('.quotation-document-title h1 { font-size: 20px !important; }', 'Quotation title must keep readable formal emphasis');
includes('.quotation-info-panel { font-size: 11.5px !important; }', 'Quotation customer/document metadata must remain readable');
includes('.quotation-table-wrap table { font-size: 11px !important; }', 'Quotation item table must keep readable body typography');
includes('.quotation-table-wrap tbody td > div + div { font-size: 10px !important; }', 'Quotation line detail text must remain readable');
includes('.quotation-settlement { font-size: 11px !important; }', 'Quotation totals and terms must remain readable');
includes('.quotation-settlement section:last-child > div:last-child { font-size: 14px !important; }', 'Quotation grand total must retain strong visual hierarchy');
includes('.quotation-signatures { font-size: 11px !important; }', 'Quotation signature labels must remain readable');
includes('return Math.max(0, 130 - occupied);', 'Typography refinement must preserve the verified extended table depth');
includes('quotation-signatures absolute bottom-[5mm]', 'Typography refinement must preserve verified signature geometry');

console.log('Quotation Print Typography Contract: PASS');
