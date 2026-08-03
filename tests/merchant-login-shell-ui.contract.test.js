import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('merchant login shell UI contract', () => {
  it('keeps /login inside a public merchant auth shell without exposing POS surfaces', () => {
    const router = read('src/routes/AppRouter.jsx');
    const shell = read('src/features/auth/layouts/MerchantLoginShell.jsx');

    expect(router).toContain("import MerchantLoginShell from '@/features/auth/layouts/MerchantLoginShell'");

    const nestedLoginRoute = /\{\s*element:\s*<MerchantLoginShell\s*\/>,\s*children:\s*\[\s*\{\s*path:\s*['\"]login['\"],\s*element:\s*<LoginPage\s*\/>/s;
    expect(router).toMatch(nestedLoginRoute);

    const loginPageRouteCount = (router.match(/element:\s*<LoginPage\s*\/>/g) || []).length;
    expect(loginPageRouteCount).toBe(1);

    expect(router).toContain("path: 'partner-portal/forgot-password'");
    expect(router).toContain("path: 'partner-portal/reset-password'");

    expect(shell).toContain('<Outlet />');
    expect(shell).toContain('SADUAKSABUY');
    expect(shell).toContain('MERCHANT CENTER');
    expect(shell).toContain('กลับหน้าพาร์ทเนอร์');
    expect(shell).toContain('การเข้าสู่ระบบที่ปลอดภัยสำหรับร้านพาร์ทเนอร์');

    expect(shell).not.toContain('POS SYSTEM');
    expect(shell).not.toContain('ENTERPRISE COMMAND RAIL');
    expect(shell).not.toContain('BRANCH ONLINE');
    expect(shell).not.toContain('POS OPERATOR');
    expect(shell).not.toContain('topItems');
    expect(shell).not.toContain('sideItems');
    expect(shell).not.toContain('apiClient');
    expect(shell).not.toContain('useAuthStore');
  });
});
