const fs = require('fs');
const path = require('path');
const assert = require('assert');

const source = fs.readFileSync(
  path.join(__dirname, '../src/features/employee/workspaces/LegacyEmployeeFormWorkspace.jsx'),
  'utf8',
);

assert.match(source, /const submittingRef = useRef\(false\)/, 'legacy employee edit must have synchronous submit ownership');
assert.match(source, /const employeeContextRef = useRef\(\{ id, shopSlug \}\)/, 'legacy employee edit must track current entity/shop context');
assert.match(source, /const loadRequestRef = useRef\(0\)/, 'legacy employee edit must sequence reads');
assert.match(source, /const updateRequestRef = useRef\(0\)/, 'legacy employee edit must sequence updates');
assert.match(source, /const employeeIdSnapshot = id/, 'update must snapshot employee id');
assert.match(source, /const shopSlugSnapshot = shopSlug/, 'update must snapshot shop slug');
assert.match(source, /const payloadSnapshot = \{ \.\.\.formData \}/, 'update must snapshot payload');
assert.match(source, /employee:legacy-update:\$\{employeeIdSnapshot\}:context-changed:error/, 'successful persistence after context change must surface partial success');
assert.match(source, /employee:legacy-update:\$\{employeeIdSnapshot\}:success/, 'success feedback must be entity scoped');
assert.match(source, /employee:legacy-update:\$\{employeeIdSnapshot\}:error/, 'error feedback must be entity scoped');
assert.match(source, /employee:legacy-edit:\$\{employeeIdSnapshot\}:load:error/, 'load feedback must be entity scoped');
assert.match(source, /if \(ownsContext\(\)\) \{\s*submittingRef\.current = false;/, 'finally must release only the owning request');

console.log('Employee legacy edit cross-context authority contract: PASS');
