import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('supplier workspace mutation authority', () => {
  it('serializes create mutations synchronously and snapshots payload/navigation state', () => {
    const source = read('src/features/supplier/workspace/SupplierCreateWorkspace.jsx');

    expect(source).toContain('const mutationRef = useRef(false)');
    expect(source).toContain('if (loading || mutationRef.current) return');
    expect(source).toContain('const payload = normalizeSupplierMutationPayload(formData)');
    expect(source).toContain('const listPath = paths.list');
    expect(source).toContain('mutationRef.current = true');
    expect(source).toContain('mutationRef.current = false');
    expect(source).toContain('loading={mutationBusy}');
  });

  it('shares one synchronous mutation lock across edit and delete flows', () => {
    const source = read('src/features/supplier/workspace/SupplierEditWorkspace.jsx');

    expect(source).toContain('const mutationRef = useRef(false)');
    expect(source).toContain('const mutationBusy = submitting || deleting || mutationRef.current');
    expect(source).toContain('if (mutationBusy) return');
    expect(source).toContain('const supplierId = id');
    expect(source).toContain('const payload = normalizeSupplierMutationPayload(formData)');
    expect(source).toContain('await updateSupplierAction(supplierId, payload)');
    expect(source).toContain('await deleteSupplierAction(supplierId)');
    expect(source).toContain('disabled={mutationBusy}');
    expect(source).toContain('loading={mutationBusy}');
  });
});
