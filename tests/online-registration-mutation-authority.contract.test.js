import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Online registration mutation authority', () => {
  it('serializes registration and emits ADS outcomes before returning to login', () => {
    const source = read('src/features/online/order/components/RegisterForm.jsx');

    expect(source).toContain('const submittingRef = useRef(false)');
    expect(source).toContain('if (submittingRef.current) return');
    expect(source).toContain('const payloadSnapshot = {');
    expect(source).toContain('submittingRef.current = true');
    expect(source).toContain("'online-register:create:success'");
    expect(source).toContain("'online-register:create:error'");
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
    expect(source.indexOf('feedback.actionSuccess')).toBeLessThan(source.indexOf('setShowRegister(false)'));
  });

  it('exposes visible progress and freezes form/navigation while submitting', () => {
    const source = read('src/features/online/order/components/RegisterForm.jsx');

    expect(source).toContain('disabled={submitting}');
    expect(source).toContain("submitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'");
    expect(source).toContain('if (!submittingRef.current) setShowRegister(false)');
  });
});
