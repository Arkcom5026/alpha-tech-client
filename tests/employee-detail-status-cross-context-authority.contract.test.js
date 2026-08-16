const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'src/features/employee/workspaces/EmployeeDetailWorkspace.jsx');
const source = fs.readFileSync(file, 'utf8');

const required = [
  'const employeeContextRef = useRef({ id, shopSlug });',
  'const loadRequestRef = useRef(0);',
  'const statusRequestRef = useRef(0);',
  'const statusMutationRef = useRef(false);',
  'const employeeIdSnapshot = employee.id;',
  'const routeEmployeeIdSnapshot = id;',
  'const shopSlugSnapshot = shopSlug;',
  'const nextActiveSnapshot = status !== \'active\';',
  'employee:${employeeIdSnapshot}:status:context-changed:error',
  'employee:${employeeIdSnapshot}:${nextActiveSnapshot ? \'activate\' : \'suspend\'}:success',
  'employee:${employeeIdSnapshot}:${nextActiveSnapshot ? \'activate\' : \'suspend\'}:error',
  'const mutationBusy = changingStatus || statusMutationRef.current;',
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Missing Employee Detail authority contract token: ${token}`);
  }
}

if (!source.includes('if (!ownsContext()) {')) {
  throw new Error('Employee status mutation must reject stale context after persistence.');
}

console.log('Employee Detail status cross-context authority contract: PASS');
