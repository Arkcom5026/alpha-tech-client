import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const sourcePath = path.resolve('src/features/employee/workspaces/ManageRolesWorkspace.jsx');
const source = fs.readFileSync(sourcePath, 'utf8');

assert.match(source, /useRef/);
assert.match(source, /const mutationRef = useRef\(null\)/);
assert.match(source, /mutationRef\.current = \{ type: 'role', employeeId: target\.employeeId \}/);
assert.match(source, /mutationRef\.current = \{ type: 'lifecycle', employeeId \}/);
assert.match(source, /const target = \{[\s\S]*employeeId:[\s\S]*userId:[\s\S]*nextRole:/);
assert.match(source, /const nextActiveSnapshot = Boolean\(nextActive\)/);
assert.match(source, /employee:\$\{target\.employeeId\}:role:update:success/);
assert.match(source, /employee:\$\{target\.employeeId\}:role:update:error/);
assert.match(source, /employee:\$\{employeeId\}:role-lifecycle:/);
assert.match(source, /Boolean\(mutationRef\.current\)/);

console.log('Employee role management mutation authority contract: PASS');
