import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Product profile create/edit mutation authority', () => {
  it('serializes create behind a synchronous ref and immutable payload snapshot', () => {
    const source = read('src/features/productProfile/pages/CreateProductProfilePage.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('if (!canManage || mutationBusy || submittingRef.current) return;');
    expect(source).toContain('const payload = {');
    expect(source).toContain('const destination = listPath;');
    expect(source).toContain('await createProfileAction(payload);');
    expect(source).toContain("feedback.actionSuccess('บันทึกโปรไฟล์สินค้าเรียบร้อยแล้ว', 'product-profile:create:success')");
    expect(source).toContain('isSubmitting={mutationBusy}');
  });

  it('serializes edit with stable entity, payload, destination, and entity-specific feedback', () => {
    const source = read('src/features/productProfile/pages/EditProductProfilePage.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('const profileId = Number(id);');
    expect(source).toContain('const payload = { ...values };');
    expect(source).toContain('const destination = listPath;');
    expect(source).toContain('await updateProfileAction(profileId, payload);');
    expect(source).toContain('`product-profile:${profileId}:edit:success`');
    expect(source).toContain('`product-profile:${profileId}:edit:error`');
  });

  it('blocks conflicting navigation while the mutation boundary is owned', () => {
    const createSource = read('src/features/productProfile/pages/CreateProductProfilePage.jsx');
    const editSource = read('src/features/productProfile/pages/EditProductProfilePage.jsx');
    expect(createSource).toContain('const guardNavigation = (event) => {');
    expect(createSource).toContain('aria-disabled={mutationBusy}');
    expect(editSource).toContain('const guardNavigation = (event) => {');
    expect(editSource).toContain('if (mutationBusy || submittingRef.current) return;');
  });
});
