import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/auth/components/RegisterCustomerForm.jsx');
const source = fs.readFileSync(target, 'utf8');

const required = [
  "const submittingRef = useRef(false);",
  "const shopSlugRef = useRef(shopSlug || 'advancetech');",
  'const loginRequestRef = useRef(0);',
  'const credentialsSnapshot = { ...form };',
  'if (shopSlugRef.current !== targetSlug || loginRequestRef.current !== requestId)',
  'auth-employee-login:${targetSlug}:success',
  'auth-employee-login:${targetSlug}:context-changed:error',
  'auth-employee-login:${targetSlug}:error',
  'const interactionBusy = submitting || submittingRef.current;',
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing employee login authority token: ${token}`);
}

console.log('Employee login cross-slug authority contract: PASS');
