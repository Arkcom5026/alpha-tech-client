import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('merchant login shell UI contract', () => {
  it('keeps /login inside the unauthenticated merchant management shell', () => {
    const router = read('src/routes/AppRouter.jsx');
    const shell = read('src/features/auth/layouts/MerchantLoginShell.jsx');

    expect(router).toContain("import MerchantLoginShell from '@/features/auth/layouts/MerchantLoginShell'");
    expect(router).toContain('element: <MerchantLoginShell />');
    expect(router).toContain("path: 'login'");
    expect(router).not.toMatch(/path:\s*['\"]login['\"],\s*\n\s*element:\s*<LoginPage\s*\/>/);

    expect(shell).toContain('<Outlet />');
    expect(shell).toContain('POS SYSTEM');
    expect(shell).toContain('ENTERPRISE COMMAND RAIL');
    expect(shell).toContain('Merchant Center');
    expect(shell).toContain('ระบบพร้อมใช้งาน');
    expect(shell).not.toContain('apiClient');
    expect(shell).not.toContain('useAuthStore');
  });
});
