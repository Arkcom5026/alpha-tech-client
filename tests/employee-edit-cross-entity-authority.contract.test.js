import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('src/features/employee/workspaces/EmployeeEditWorkspace.jsx');
const source = fs.readFileSync(target, 'utf8');

const required = [
  'const employeeContextRef = useRef',
  'const updateRequestRef = useRef(0);',
  "const employeeIdSnapshot = String(id || '');",
  "const shopSlugSnapshot = shopSlug || 'advancetech';",
  'employee:update:${employeeIdSnapshot}:success',
  'employee:update:${employeeIdSnapshot}:context-changed:error',
  'employee:update:${employeeIdSnapshot}:error',
  'requestId === updateRequestRef.current',
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Missing employee edit authority token: ${token}`);
}

console.log('Employee edit cross-entity authority contract: PASS');
