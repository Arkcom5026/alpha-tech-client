import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/bill/pages/PrintBillPageFullTax.jsx');
const document = read('src/features/bill/components/FullTaxA4Document.jsx');
const globalStyles = read('src/index.css');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  page.includes("import FullTaxA4Document from '@/features/bill/components/FullTaxA4Document'")
    && !page.includes('BillLayoutFullTax'),
  'Full-tax workspace must render the deterministic A4 document instead of the legacy auto-fragmenting layout.'
);

assert(
  document.includes('const MAX_ROWS_LAST_PAGE = 20;')
    && document.includes('const MAX_ROWS_NORMAL_PAGE = 24;')
    && document.includes('paginateItems(displayItems)'),
  'Full-tax A4 pagination must use the fuller 20-row last-page grid while retaining deterministic multi-page capacity.'
);

assert(
  document.includes('const MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER = 17;')
    && document.includes('paginateItemsWithReservedFooter(displayItems)')
    && document.includes('hasPresentationFooter ? MAX_ROWS_LAST_PAGE_WITH_PRESENTATION_FOOTER : MAX_ROWS_LAST_PAGE'),
  'Full-tax A4 pagination must preserve legacy 20-row last pages without a presentation footer and reserve three rows only when a footer is visible.'
);

assert(
  document.includes('const PHYSICAL_PAGE_HEIGHT_MM = 296;')
    && document.includes('const PRINT_PAGE_MARGIN_MM = 4;')
    && document.includes('const PRINT_SHEET_WIDTH_MM = 201;')
    && document.includes('const PRINT_SHEET_HEIGHT_MM = 288;')
    && document.includes('@page { size: A4; margin: ${PRINT_PAGE_MARGIN_MM}mm; }')
    && document.includes('width: ${PRINT_SHEET_WIDTH_MM}mm !important;')
    && document.includes('height: ${PRINT_SHEET_HEIGHT_MM}mm !important;')
    && document.includes('min-height: ${PRINT_SHEET_HEIGHT_MM}mm !important;')
    && document.includes('padding: 5mm !important;')
    && document.includes('border-radius: 2.5mm !important;')
    && document.includes('overflow: hidden !important;'),
  'Printed full-tax sheets must stay inside the print-safe A4 content box with a rounded outer document frame.'
);

assert(
  document.includes('DOCUMENT_FONT_FAMILY')
    && document.includes('TH Sarabun New')
    && document.includes('Sarabun')
    && globalStyles.includes('--document-font-family: "TH Sarabun New", "Sarabun", Tahoma, Arial, sans-serif;')
    && globalStyles.includes('body *')
    && globalStyles.includes('font-family: var(--document-font-family) !important;'),
  'Printed documents must share the TH Sarabun-first document typography authority without changing normal application UI typography.'
);

assert(
  document.includes('full-tax-editor-column')
    && document.includes('.full-tax-a4-page .full-tax-editor-column')
    && document.includes('display: none !important;'),
  'The document-line editor column must remain available on screen but be removed from printed table geometry.'
);

assert(
  document.includes('<div role="banner"')
    && !document.includes('<header className='),
  'Document identity must not use the global semantic header selector that the application hides during printing.'
);

assert(
  page.includes('full-tax-print-shell')
    && page.includes('full-tax-print-frame')
    && page.includes('min-height: 0 !important;')
    && page.includes('height: auto !important;')
    && page.includes('overflow: visible !important;'),
  'The surrounding application shell must collapse out of print pagination so it cannot create a trailing blank page.'
);

assert(
  document.includes("className=\"absolute bottom-[28mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-5 text-[13px]\"")
    && document.includes("className=\"absolute bottom-[5mm] left-[6mm] right-[6mm] grid grid-cols-2 gap-12 text-center text-[15px]\""),
  'Totals and signatures must occupy reserved last-page zones with visible breathing room below the item table.'
);

assert(
  document.includes('data-testid="full-tax-presentation-footer-zone"')
    && document.includes('bottom-[50mm]')
    && document.includes('height: `${PRESENTATION_FOOTER_HEIGHT_MM}mm`')
    && document.includes('<StatutoryTaxPresentationFooter')
    && document.includes('notes={normalizedPresentationFooter.notes}')
    && document.includes('customFooter={normalizedPresentationFooter.customFooter}'),
  'Statutory Notes and Custom Footer content must render only inside the reserved full-tax last-page zone above totals and signatures.'
);

assert(
  document.includes("pageBreakAfter: page.isLast ? 'auto' : 'always'")
    && document.includes("breakAfter: page.isLast ? 'auto' : 'page'"),
  'Multi-page full-tax output must define page boundaries explicitly.'
);

assert(
  document.includes('print:hidden')
    && document.includes('documentPrefix')
    && document.includes('documentSuffix')
    && document.includes('onSaveDocumentLine?.(item)'),
  'Deterministic A4 rendering must preserve the existing document-line editor workspace while hiding editor controls on paper.'
);

console.log('Full Tax Deterministic A4 Contract: PASS');