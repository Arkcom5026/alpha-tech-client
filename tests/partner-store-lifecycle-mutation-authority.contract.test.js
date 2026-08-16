import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Partner Store lifecycle mutation authority', () => {
  it('serializes public application submission and snapshots its payload', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreApplicationPage.jsx');
    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('if (submitting || submittingRef.current) return');
    expect(page).toContain('const formSnapshot = { ...form }');
    expect(page).toContain('fieldset disabled={mutationBusy}');
    expect(page).toContain("feedback.actionSuccess(");
    expect(page).toContain("feedback.actionError(");
  });

  it('keeps account activation under synchronous mutation authority', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreActivationPage.jsx');
    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('if (submitting || submittingRef.current) return');
    expect(page).toContain('const mutationBusy = submitting || submittingRef.current');
    expect(page).toContain('disabled={mutationBusy || !token}');
    expect(page).toContain("feedback.actionSuccess(");
    expect(page).toContain("feedback.actionError(");
  });

  it('snapshots first-login onboarding confirmations before completion', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreOnboardingPage.jsx');
    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('const storeProfileConfirmed = Boolean(confirmStoreProfile)');
    expect(page).toContain('const ownerContactConfirmed = Boolean(confirmOwnerContact)');
    expect(page).toContain('fieldset disabled={mutationBusy}');
    expect(page).toContain("feedback.actionSuccess(");
    expect(page).toContain("feedback.actionError(");
  });

  it('preserves readiness certification failure after assessment reload', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreOperationalReadinessPage.jsx');
    expect(page).toContain('if (submitting || submittingRef.current) return');
    expect(page).toContain('const message = messageFrom(requestError)');
    expect(page).toContain('await load()');
    expect(page).toContain('setError(message)');
    expect(page.indexOf('await load()')).toBeLessThan(page.lastIndexOf('setError(message)'));
    expect(page).toContain("feedback.actionSuccess(");
    expect(page).toContain("feedback.actionError(");
  });
});
