import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('action feedback checkpoint wave 119-122', () => {
  it('serializes branch price workspace saves with snapshot authority', () => {
    const page = read('src/features/branchPrice/workspace/ManageBranchPriceWorkspace.jsx');
    expect(page).toContain('const savingRef = useRef(false)');
    expect(page).toContain('if (pendingList.length === 0 || saving || savingRef.current) return');
    expect(page).toContain('const updates = pendingList.map');
    expect(page).toContain('const refreshFilters = {');
    expect(page).toContain('savingRef.current = true');
  });

  it('uses one synchronous held-cart mutation authority for save and cancel', () => {
    const page = read('src/features/sales/held-cart/components/PosHeldCartPanel.jsx');
    expect(page).toContain('const mutationRef = useRef(false)');
    expect(page).toContain('if (saving || mutationRef.current) return');
    expect(page).toContain('if (cancellingId || mutationRef.current) return');
    expect(page).toContain('const payload = {');
    expect(page).toContain('const mutationBusy = saving || Boolean(cancellingId)');
  });

  it('serializes partner activation and snapshots credentials before request', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreActivationPage.jsx');
    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('if (submitting || submittingRef.current) return');
    expect(page).toContain('const activationToken = token');
    expect(page).toContain('const nextPassword = password');
    expect(page).toContain('disabled={submitting}');
  });

  it('serializes operational readiness certification with a destination snapshot', () => {
    const page = read('src/features/partnerStoreApplication/pages/PartnerStoreOperationalReadinessPage.jsx');
    expect(page).toContain('const submittingRef = useRef(false)');
    expect(page).toContain('if (submitting || submittingRef.current) return');
    expect(page).toContain('const readinessConfirmed = Boolean(assessment.allReady)');
    expect(page).toContain('const destinationSlug = canonicalSlug');
    expect(page).toContain('navigate(`/${destinationSlug}/pos/dashboard`');
  });
});
