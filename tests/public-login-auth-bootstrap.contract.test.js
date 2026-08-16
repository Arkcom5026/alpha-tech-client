import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('public-first auth boundary contract', () => {
  it('keeps public app rendering independent from authentication bootstrap', () => {
    const app = read('src/App.jsx');

    expect(app).toContain('<RouterProvider router={router} />');
    expect(app).not.toContain('useAuthStore');
    expect(app).not.toContain('bootstrapAuthAction');
    expect(app).not.toContain('authBootstrapState');
    expect(app).not.toContain('กำลังตรวจสอบสถานะ');
  });

  it('moves session recovery to the protected route boundary', () => {
    const guard = read('src/features/auth/components/ProtectedRoute.jsx');

    expect(guard).toContain('const bootstrapAuthAction = useAuthStore');
    expect(guard).toContain('useEffect(() => {');
    expect(guard).toContain('bootstrapAuthAction?.()');
    expect(guard).toContain("authBootstrapState === 'loading'");
    expect(guard).toContain("authBootstrapState === 'unauthenticated'");
    expect(guard).toContain('<Navigate to="/login" replace state={{ from: location }} />');
  });
});
