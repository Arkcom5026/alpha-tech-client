import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/partnerStoreApplication/pages/PartnerStoreOperationalReadinessPage.jsx');
const source = fs.readFileSync(target, 'utf8');

const required = [
  'const shopSlugRef = useRef(shopSlug);',
  'const loadRequestRef = useRef(0);',
  'const requestId = ++loadRequestRef.current;',
  'String(shopSlugRef.current || \'\') === shopSlugSnapshot',
  'return { ok: false, stale: true }',
  'const routeSlugSnapshot = String(shopSlug || \'\');',
  'certify:context-changed:error',
  'const mutationBusy = submitting || submittingRef.current;',
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing Partner Store readiness cross-slug authority token: ${token}`);
  }
}

console.log('Partner Store operational readiness cross-slug authority contract: PASS');
