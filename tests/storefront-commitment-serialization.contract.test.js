import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Storefront commitment serialization', () => {
  it('serializes OTP and reservation actions behind synchronous snapshots', () => {
    const page = read('src/features/storefront/pages/PublicStorefrontIdentityPage.jsx');

    expect(page).toContain('const busyRef = useRef(false)');
    expect(page).toContain('if (busy || busyRef.current) return');
    expect(page).toContain('const phoneSnapshot = phone.trim()');
    expect(page).toContain('const challengeIdSnapshot = challenge?.challengeId');
    expect(page).toContain('const otpSnapshot = otp');
    expect(page).toContain('const proofTokenSnapshot = proofToken');
    expect(page).toContain('const interactionBusy = busy || busyRef.current');
    expect(page).toContain('disabled={interactionBusy}');
    expect(page).toContain('busyRef.current = true');
    expect(page).toContain('busyRef.current = false');
  });
});
