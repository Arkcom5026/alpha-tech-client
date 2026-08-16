import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('Partner Store First Login Onboarding UI v2 contract', () => {
  it('forces activated partner owners through onboarding before POS', () => {
    const api = read('src/features/partnerStoreApplication/api/partnerStoreOnboardingApi.js');
    const gate = read('src/features/partnerStoreApplication/guards/PartnerStoreOnboardingGate.jsx');
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreOnboardingPage.jsx');
    const router = read('src/routes/AppRouter.jsx');

    expect(api).toContain("'/partner-store/onboarding/me'");
    expect(api).toContain("'/partner-store/onboarding/complete'");

    expect(gate).toContain('getPartnerStoreOnboarding');
    expect(gate).toContain('isPartnerStoreOwner');
    expect(gate).toContain('requiresOnboarding');
    expect(gate).toContain('/pos/onboarding');
    expect(gate).toContain('<PosAdaptiveShell />');

    expect(router).toContain("path: ':shopSlug/pos/onboarding'");
    expect(router).toContain('<PartnerStoreOnboardingPage />');
    expect(router).toContain('<PartnerStoreOnboardingGate />');

    expect(page).toContain('confirmStoreProfile');
    expect(page).toContain('confirmOwnerContact');
    expect(page).toContain('completePartnerStoreOnboarding');
    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('const interactionBusy = submitting || submittingRef.current');
    expect(page).toContain('const confirmedStoreProfile = Boolean(confirmStoreProfile)');
    expect(page).toContain('const confirmedOwnerContact = Boolean(confirmOwnerContact)');
    expect(page).toContain('fieldset disabled={interactionBusy}');
    expect(page).toContain('feedback.actionSuccess(');
    expect(page).toContain('feedback.actionError(');
    expect(page).toContain('ยืนยันและเข้าสู่ระบบร้าน');
    expect(page).toContain('ยังไม่ใช่ Operational Certification ของร้าน');
    expect(page).toContain('/pos/dashboard');
  });
});
