import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Wave 157 brand/category/position mutation authority', () => {
  it('serializes brand create and edit/toggle commands behind synchronous refs', () => {
    const createSource = read('src/features/brand/workspace/CreateBrandWorkspace.jsx');
    const editSource = read('src/features/brand/workspace/EditBrandWorkspace.jsx');

    expect(createSource).toContain('const submittingRef = useRef(false)');
    expect(createSource).toContain('if (saving || submittingRef.current) return');
    expect(createSource).toContain('const nameSnapshot = String(name || \'\').trim()');
    expect(createSource).toContain('submittingRef.current = true');

    expect(editSource).toContain('const mutationRef = useRef(false)');
    expect(editSource).toContain('const brandIdSnapshot = numericId');
    expect(editSource).toContain('if (!existing?.id || saving || mutationRef.current) return');
    expect(editSource).toContain('`brand:${brandIdSnapshot}:update:success`');
    expect(editSource).toContain("nextActive ? 'activate' : 'deactivate'");
  });

  it('serializes category create/edit commands and snapshots route/payload authority', () => {
    const createSource = read('src/features/category/workspace/CreateCategoryWorkspace.jsx');
    const editSource = read('src/features/category/workspace/EditCategoryWorkspace.jsx');

    expect(createSource).toContain('const submittingRef = useRef(false);');
    expect(createSource).toContain('if (submitting || submittingRef.current) return;');
    expect(createSource).toContain('const payload = { ...data, name: String(data?.name || \'\').trim() };');
    expect(createSource).toContain('const listPathSnapshot = listPath;');

    expect(editSource).toContain('const categoryIdSnapshot = id;');
    expect(editSource).toContain('await updateAction(categoryIdSnapshot, payload);');
    expect(editSource).toContain('`category:${categoryIdSnapshot}:update:success`');
    expect(editSource).toContain('!submittingRef.current && navigate(listPath)');
  });

  it('serializes position create/edit commands and freezes conflicting form edits', () => {
    const createSource = read('src/features/position/workspace/CreatePositionWorkspace.jsx');
    const editSource = read('src/features/position/workspace/EditPositionWorkspace.jsx');
    const formSource = read('src/features/position/components/PositionForm.jsx');

    expect(createSource).toContain('const submittingRef = useRef(false);');
    expect(createSource).toContain('const payloadSnapshot = {');
    expect(createSource).toContain('mutationOwnedRef={submittingRef}');

    expect(editSource).toContain('const positionIdSnapshot = idNum;');
    expect(editSource).toContain('await updateAction(positionIdSnapshot, payloadSnapshot);');
    expect(editSource).toContain('`position:${positionIdSnapshot}:update:success`');

    expect(formSource).toContain('const mutationBusy = submitting || Boolean(mutationOwnedRef?.current);');
    expect(formSource).toContain('if (!canSubmit || mutationOwnedRef?.current) return;');
    expect(formSource).toContain('disabled={mutationBusy}');
  });
});
