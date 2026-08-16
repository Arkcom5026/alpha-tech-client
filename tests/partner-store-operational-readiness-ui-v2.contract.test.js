import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('partner store operational readiness UI v2 contract', () => {
  it('gates partner owner POS access on explicit operational certification', () => {
    const api = read('src/features/partnerStoreApplication/api/partnerStoreOperationalReadinessApi.js');
    const gate = read('src/features/partnerStoreApplication/guards/PartnerStoreOnboardingGate.jsx');
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreOperationalReadinessPage.jsx');
    const router = read('src/routes/AppRouter.jsx');
    const onboardingPage = read('src/features/partnerStoreApplication/pages/PartnerStoreOnboardingPage.jsx');

    expect(api).toContain("'/partner-store/readiness/me'");
    expect(api).toContain("'/partner-store/readiness/certify'");
    expect(gate).toContain('getPartnerStoreOnboarding');
    expect(gate).toContain('getPartnerStoreOperationalReadiness');
    expect(gate.indexOf('getPartnerStoreOnboarding()')).toBeLessThan(gate.indexOf('getPartnerStoreOperationalReadiness()'));
    expect(gate).toContain('requiresOnboarding');
    expect(gate).toContain('requiresCertification');
    expect(gate).toContain('/pos/readiness');

    expect(page).toContain('รับรองความพร้อมก่อนเริ่มใช้งานร้าน');
    expect(page).toContain('assessment.allReady');
    expect(page).toContain('certifyPartnerStoreOperationalReadiness');
    expect(page).toContain('submittingRef.current');
    expect(page).toContain("feedback.actionSuccess(");
    expect(page).toContain("feedback.actionError(");
    expect(page).toContain('setError(mutationMessage)');
    expect(page).toContain('รับรองความพร้อมและเข้าสู่ POS');
    expect(page).toContain("check.key === 'serviceMode'");
    expect(page).toContain('check.details.reason');
    expect(page).toContain('system health verification');
    expect(router).toContain("path: ':shopSlug/pos/readiness'");
    expect(router).toContain('<PartnerStoreOperationalReadinessPage />');

    expect(onboardingPage).toContain('ยังไม่ใช่ Operational Certification ของร้าน');
  });
});
