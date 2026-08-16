import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(
  path.resolve(here, '../src/features/settings/pages/PartnerProfilePage.jsx'),
  'utf8',
);

const mustInclude = [
  'const shopSlugRef = useRef(shopSlug);',
  'const saveRequestRef = useRef(0);',
  'shopSlugRef.current = shopSlug;',
  'saveRequestRef.current += 1;',
  'const shopSlugSnapshot = shopSlug;',
  'const requestId = saveRequestRef.current + 1;',
  'shopSlugRef.current === shopSlugSnapshot && saveRequestRef.current === requestId',
  'partner-profile:${shopSlugSnapshot}:save:success',
  'partner-profile:${shopSlugSnapshot}:save:error',
  'partner-profile:${shopSlug}:load:error',
];

for (const needle of mustInclude) {
  if (!source.includes(needle)) {
    throw new Error(`Partner profile cross-slug authority contract missing: ${needle}`);
  }
}

console.log('Partner Profile Cross-Slug Authority Contract: PASS');
