import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Product type create/edit mutation authority', () => {
  it('locks create behind a synchronous ref and stable payload snapshot', () => {
    const source = read('src/features/productType/workspace/CreateProductTypeWorkspace.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('if (!canManage || busy || submittingRef.current) return;');
    expect(source).toContain('const payload = { ...formData };');
    expect(source).toContain('submittingRef.current = true;');
    expect(source).toContain('await createProductTypeAction(payload);');
    expect(source).toContain('isSubmitting={busy}');
  });

  it('locks edit behind a synchronous ref and stable id/payload/navigation snapshots', () => {
    const source = read('src/features/productType/workspace/EditProductTypeWorkspace.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('const productTypeIdSnapshot = Number(id);');
    expect(source).toContain('const payload = { ...formPayload };');
    expect(source).toContain('const listPathSnapshot = listPath;');
    expect(source).toContain('await updateProductTypeAction(productTypeIdSnapshot, payload);');
    expect(source).toContain('`product-type:${productTypeIdSnapshot}:update:success`');
    expect(source).toContain('`product-type:${productTypeIdSnapshot}:update:error`');
    expect(source).toContain('navigate(listPathSnapshot);');
    expect(source).toContain('isSubmitting={busy}');
  });
});
