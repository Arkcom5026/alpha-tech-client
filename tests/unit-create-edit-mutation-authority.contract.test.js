import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Unit create/edit mutation authority', () => {
  it('locks create behind a synchronous ref and immutable payload snapshot', () => {
    const source = read('src/features/unit/workspace/CreateUnitWorkspace.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('if (isSubmitting || submittingRef.current) return;');
    expect(source).toContain('const payload = { ...data');
    expect(source).toContain('submittingRef.current = true;');
    expect(source).toContain("feedback.actionSuccess('เพิ่มหน่วยนับเรียบร้อยแล้ว', 'unit:create:success')");
  });

  it('locks edit behind a synchronous ref and stable unit id snapshot', () => {
    const source = read('src/features/unit/workspace/EditUnitWorkspace.jsx');
    expect(source).toContain('const submittingRef = useRef(false);');
    expect(source).toContain('const unitIdSnapshot = id;');
    expect(source).toContain('const payload = { ...formData');
    expect(source).toContain('await updateUnit(unitIdSnapshot, payload);');
    expect(source).toContain('`unit:${unitIdSnapshot}:update:success`');
    expect(source).toContain('`unit:${unitIdSnapshot}:update:error`');
  });

  it('freezes unit form controls while the persistence boundary is owned', () => {
    const source = read('src/features/unit/components/UnitForm.jsx');
    expect(source).toContain('<fieldset disabled={isSubmitting}');
    expect(source).toContain('<Input {...register(\'name\')} disabled={isSubmitting}');
    expect(source).toContain('<Button type="submit" disabled={isSubmitting}>');
  });
});
