import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Auth customer registration mutation authority', () => {
  it('serializes registration around a synchronous ref and immutable payload', () => {
    const source = read('src/features/auth/workspaces/RegisterWorkspace.jsx');

    expect(source).toContain('const submittingRef = useRef(false)');
    expect(source).toContain('if (submittingRef.current) return');
    expect(source).toContain("const payloadSnapshot = { name, phone, email, password, role: 'customer' }");
    expect(source).toContain('submittingRef.current = true');
    expect(source).toContain('await registerUser(payloadSnapshot)');
    expect(source).toContain('submittingRef.current = false');
    expect(source).toContain("'auth-customer-register-success'");
    expect(source).toContain("'auth-customer-register-error'");
  });

  it('freezes registration inputs while react-hook-form exposes submit progress', () => {
    const source = read('src/features/auth/workspaces/RegisterWorkspace.jsx');

    expect(source).toContain('disabled={isSubmitting}');
    expect(source).toContain("isSubmitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'");
  });
});
