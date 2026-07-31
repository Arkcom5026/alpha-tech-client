import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const header = read('src/features/repair/components/RepairShellHeader.jsx');
const helpCenter = read('src/features/repair/help/RepairHelpCenter.jsx');
const content = read('src/features/repair/help/repairHelpContent.js');

assert(header.includes("import RepairHelpCenter from '../help/RepairHelpCenter'"), 'Repair header must own the help center entry point');
assert(header.includes('คู่มือ'), 'Repair header must expose a Thai guide button');
assert(header.includes('aria-haspopup="dialog"'), 'Guide button must declare dialog behavior');
assert(header.includes('<RepairHelpCenter'), 'Repair header must render the help center');

assert(helpCenter.includes('role="dialog"'), 'Help center must render as an accessible dialog');
assert(helpCenter.includes('aria-modal="true"'), 'Help center must be modal while open');
assert(helpCenter.includes("event.key === 'Escape'"), 'Help center must close with Escape');
assert(helpCenter.includes("document.body.style.overflow = 'hidden'"), 'Help center must prevent background scrolling');
assert(helpCenter.includes('ค้นหาในคู่มือ'), 'Help center must provide search');
assert(helpCenter.includes('inferRepairHelpSection(location.pathname)'), 'Help center must infer contextual content from the current route');

['overview', 'intake', 'queue', 'estimate', 'claim', 'control-center', 'tracking', 'handover', 'troubleshooting'].forEach((sectionId) => {
  assert(content.includes(`id: '${sectionId}'`), `Missing repair guide section: ${sectionId}`);
});
assert(content.includes("pathname.includes('repair-intake')"), 'Intake route must open intake guidance');
assert(content.includes("pathname.includes('warranty-claims')"), 'Claim route must open claim guidance');
assert(content.includes("pathname.includes('/repairs')"), 'Repair queue route must open control-center guidance');

console.log('Repair in-app help center contract: PASS');
