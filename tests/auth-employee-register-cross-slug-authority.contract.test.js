import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/auth/components/RegisterEmployeeForm.jsx');
const source = fs.readFileSync(target, 'utf8');

const required = [
  'const submittingRef = useRef(false);',
  "const shopSlugRef = useRef(shopSlug || 'advancetech');",
  'const registerRequestRef = useRef(0);',
  'const targetSlug = shopSlug || \'advancetech\';',
  'const payload = {',
  'registerRequestRef.current === requestId',
  'shopSlugRef.current === targetSlug',
  'auth-employee-register:${targetSlug}:success',
  'auth-employee-register:${targetSlug}:error',
  'auth-employee-register:${targetSlug}:context-changed:error',
  'const interactionBusy = submitting || submittingRef.current;',
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing employee registration route authority token: ${token}`);
  }
}

console.log('Employee registration cross-slug authority contract: PASS');
