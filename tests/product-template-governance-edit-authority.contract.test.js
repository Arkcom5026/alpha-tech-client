import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('product template governance edit authority', () => {
  it('serializes template mutation and snapshots submitted state', () => {
    const page = read('src/features/productTemplate/pages/ProductTemplateGovernanceEditPage.jsx');

    expect(page).toContain('const mutationRef = React.useRef(false)');
    expect(page).toContain('const mutationBusy = isSaving || mutationRef.current');
    expect(page).toContain('if (mutationBusy) return');
    expect(page).toContain('const templateId = id');
    expect(page).toContain('const formSnapshot = { ...form }');
    expect(page).toContain('const successPath = detailPath');
    expect(page).toContain('await updateTemplateAction(templateId, payload)');
  });

  it('prevents form and navigation drift while the template write is active', () => {
    const page = read('src/features/productTemplate/pages/ProductTemplateGovernanceEditPage.jsx');

    expect(page).toContain('if (mutationRef.current) return');
    expect(page).toContain('disabled={mutationBusy}');
    expect(page).toContain('disabled={isLoadingMasters || mutationBusy}');
    expect(page).toContain('disabled={mutationBusy || !String(form.name || \'\').trim() || !form.productTypeId}');
  });
});
