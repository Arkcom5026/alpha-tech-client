import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const router = read('src/routes/AppRouter.jsx');
const guard = read('src/features/auth/guards/SuperAdminAuthorityGuard.jsx');

assert.match(router, /SuperAdminAuthorityGuard/);
assert.match(router, /path:\s*':shopSlug\/superadmin'/);
assert.match(router, /element:\s*<SuperAdminAuthorityGuard\s*\/>/);
assert.match(guard, /getTokenAuthorityRole/);
assert.match(guard, /payload\?\.role/);
assert.match(guard, /authorityRole !== 'SUPERADMIN'/);
assert.match(guard, /`\/\$\{shopSlug\}\/pos`/);
assert.doesNotMatch(guard, /positionKey|positionName|isSuperAdmin/);

console.log('superadmin-token-authority-guard.contract: PASS');
