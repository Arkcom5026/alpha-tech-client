import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve('src/features/employee/workspaces/EmployeeListWorkspace.jsx'),
  'utf8',
);

const required = [
  'listContextRef',
  'listRequestRef',
  'branchOptionsRequestRef',
  'ownsListRequest',
  'const snapshot = { ...listContextRef.current }',
  'if (!ownsListRequest(requestId, snapshot)) return { ok: false, stale: true }',
  'employee:list:${branchScope}:load:error',
  "employee:list:branches:load:error",
];

for (const token of required) {
  if (!source.includes(token)) {
    throw new Error(`Employee list authority contract missing: ${token}`);
  }
}

if (source.includes("console.error('❌ โหลดพนักงานล้มเหลว:'")) {
  throw new Error('Employee list must not rely on console-only load failure feedback');
}

console.log('Employee List Cross-Context Read Authority Contract: PASS');
