import fs from 'node:fs';

const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) {
    throw new Error(message || `Expected source to include: ${value}`);
  }
};

const files = [
  'src/features/receiving/quick-stock/pages/QuickStockPage.jsx',
  'src/features/receiving/quick-stock/components/QuickReceiptWorkspaceHeader.jsx',
  'src/features/receiving/quick-stock/components/QuickReceiptProgressSummary.jsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing quick receipt mobile workspace file: ${file}`);
  }
}

const page = fs.readFileSync(files[0], 'utf8');
const header = fs.readFileSync(files[1], 'utf8');
const summary = fs.readFileSync(files[2], 'utf8');

assertIncludes(page, 'QuickReceiptWorkspaceHeader', 'Quick receipt page must compose workspace header');
assertIncludes(page, 'QuickReceiptProgressSummary', 'Quick receipt page must compose progress summary');
assertIncludes(header, 'mobile', 'Workspace header must expose mobile action composition');
assertIncludes(summary, 'Progress', 'Progress summary must expose progress information');

console.log('Purchase quick receipt mobile action polish contract: PASS');
