import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('supplier workspace mutation authority', () => {
  it('serializes create mutations and freezes navigation while saving', () => {
    const page = read('src/features/supplier/workspace/SupplierCreateWorkspace.jsx');

    expect(page).toContain('const mutationRef = useRef(false)');
    expect(page).toContain('if (loading || mutationRef.current) return');
    expect(page).toContain('const payload = normalizeSupplierMutationPayload(formData)');
    expect(page).toContain('mutationRef.current = true');
    expect(page).toContain('const mutationBusy = loading || mutationRef.current');
    expect(page).toContain('loading={mutationBusy}');
    expect(page).toContain('disabled={mutationBusy}');
  });

  it('shares one synchronous mutation authority across edit and delete', () => {
    const page = read('src/features/supplier/workspace/SupplierEditWorkspace.jsx');

    expect(page).toContain('const mutationRef = useRef(false)');
    expect(page).toContain('const mutationBusy = submitting || deleting || mutationRef.current');
    expect(page).toContain('const supplierId = id');
    expect(page).toContain('const payload = normalizeSupplierMutationPayload(formData)');
    expect(page).toContain('await updateSupplierAction(supplierId, payload)');
    expect(page).toContain('await deleteSupplierAction(supplierId)');
    expect(page).toContain('loading={mutationBusy}');
    expect(page).toContain('disabled={mutationBusy}');
  });
});
