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
includes(printPage, 'documentLogoSize', 'Quotation header must normalize logo proportions for formal A4 presentation');
includes(printPage, 'Math.min(92, Math.max(68', 'Quotation logo must stay inside the delivery-note-aligned presentation range');
includes(printPage, 'min-h-[31mm]', 'Quotation identity header must preserve a stable delivery-note-like header band');
includes(printPage, 'items-center justify-between gap-4', 'Quotation identity, logo and badge must share one balanced horizontal baseline');
includes(printPage, 'min-w-[27mm]', 'Quotation document marker must keep a stable formal badge footprint');
includes(printPage, 'quotation-document-title py-2.5', 'Quotation title rhythm must remain compact beneath the identity header');
includes(printPage, 'CUSTOMER ORIGINAL', 'Issued quotation must retain the delivery-note-compatible customer original marker');

console.log('Quotation Print Header Visibility Contract: PASS');