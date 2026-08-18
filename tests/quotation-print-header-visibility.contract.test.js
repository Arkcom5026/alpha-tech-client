import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const includes = (source, value, message) => {
  if (!source.includes(value)) throw new Error(message || `Expected source to include: ${value}`);
};
const excludes = (source, value, message) => {
  if (source.includes(value)) throw new Error(message || `Expected source to exclude: ${value}`);
};

const printPage = read('src/features/quotation/pages/QuotationPrintPage.jsx');
const globalCss = read('src/index.css');

includes(globalCss, 'header,', 'Global print rules intentionally hide application headers');
includes(printPage, '<div className="quotation-document-header', 'Quotation document header must use a printable container');
excludes(printPage, '<header className="quotation-document-header', 'Quotation document header must not use semantic header because global print rules hide it');
includes(printPage, 'buildStoreDocumentHeader', 'Printable quotation header must keep store document-header authority');
includes(printPage, 'header.logoUrl', 'Printable quotation header must render the configured logo');
includes(printPage, 'header.branchName', 'Printable quotation header must render configured store/company identity');

console.log('Quotation Print Header Visibility Contract: PASS');
