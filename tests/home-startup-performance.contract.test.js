import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

describe('Home startup performance contract', () => {
  it('does not execute the retired operational verification request from the POS header runtime', () => {
    const badge = read('src/features/system/operational-status/components/OperationalStatusBadge.jsx');
    expect(badge).toContain('const OperationalStatusBadge = () => null');
    expect(badge).not.toContain('getOperationalVerification');
    expect(badge).not.toContain('useEffect');
  });

  it('reuses a confirmed non-partner owner decision within the browser session', () => {
    const gate = read('src/features/partnerStoreApplication/guards/PartnerStoreOnboardingGate.jsx');
    expect(gate).toContain('NON_PARTNER_OWNER_CACHE_PREFIX');
    expect(gate).toContain('window.sessionStorage.getItem(cacheKey)');
    expect(gate).toContain("window.sessionStorage.setItem(cacheKey, '1')");
    expect(gate).toContain('if (!onboarding?.isPartnerStoreOwner)');
    expect(gate).toContain('rememberNonPartnerOwner(cacheKey)');
    expect(gate).toContain('if (onboarding?.requiresOnboarding)');
    expect(gate).toContain('getPartnerStoreOperationalReadiness');
  });

  it('deduplicates an in-flight onboarding authority request for the same employee and shop', () => {
    const gate = read('src/features/partnerStoreApplication/guards/PartnerStoreOnboardingGate.jsx');
    expect(gate).toContain('const onboardingRequestByCacheKey = new Map()');
    expect(gate).toContain('const getPartnerStoreOnboardingOnce = (cacheKey)');
    expect(gate).toContain('const existing = onboardingRequestByCacheKey.get(cacheKey)');
    expect(gate).toContain('if (existing) return existing');
    expect(gate).toContain('getPartnerStoreOnboardingOnce(cacheKey)');
  });
});
