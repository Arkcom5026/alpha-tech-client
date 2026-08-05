import fs from 'node:fs';

const assertIncludes = (source, value, message) => {
  if (!source.includes(value)) {
    throw new Error(message || `Expected source to include: ${value}`);
  }
};

const files = [
  'src/features/receiving/quick-stock/pages/QuickStockPage.jsx',
  'src/features/receiving/quick-stock/components/QuickReceiptSessionPanel.jsx',
  'src/features/receiving/quick-stock/components/QuickReceiptActions.jsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing quick receipt mobile workspace file: ${file}`);
  }
}

const page = fs.readFileSync(files[0], 'utf8');
const sessionPanel = fs.readFileSync(files[1], 'utf8');
const actions = fs.readFileSync(files[2], 'utf8');

assertIncludes(page, 'QuickReceiptSessionPanel', 'Quick receipt page must compose session workspace');
assertIncludes(sessionPanel, 'QuickReceiptActions', 'Session workspace must compose receipt actions');
assertIncludes(actions, 'button', 'Receipt actions must expose actionable controls');

console.log('Purchase quick receipt mobile action polish contract: PASS');
