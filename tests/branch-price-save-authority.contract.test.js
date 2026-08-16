import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('branch price save authority', () => {
  const page = read('src/features/branchPrice/workspace/ManageBranchPriceWorkspace.jsx');

  it('uses a synchronous save guard at the mutation boundary', () => {
    expect(page).toContain("import React, { useEffect, useRef, useState } from 'react';");
    expect(page).toContain('const savingRef = useRef(false);');
    expect(page).toContain('if (pendingList.length === 0 || saving || savingRef.current) return;');
    expect(page).toContain('savingRef.current = true;');
  });

  it('snapshots updates and refresh filters before the write', () => {
    expect(page).toContain('const updates = pendingList.map((item) => ({');
    expect(page).toContain('const refreshFilters = {');
    expect(page).toContain('await updateMultipleBranchPricesAction(updates);');
  });

  it('releases the authority lock when the mutation itself fails', () => {
    expect(page).toContain("feedback.actionError(saveError, 'บันทึกการเปลี่ยนราคาสินค้าไม่สำเร็จ', 'branch-price:update:error');");
    expect(page).toContain('savingRef.current = false;\n      setSaving(false);\n      return;');
  });

  it('does not report a successful write as failed when only refresh fails', () => {
    expect(page).toContain("feedback.actionSuccess('บันทึกการเปลี่ยนราคาสินค้าเรียบร้อยแล้ว', 'branch-price:update:success');");
    expect(page).toContain('await fetchAllProductsWithPriceByTokenAction(refreshFilters);');
    expect(page).toContain('บันทึกราคาเรียบร้อยแล้ว แต่โหลดรายการล่าสุดไม่สำเร็จ กรุณากดโหลดใหม่');
    expect(page).toContain("'branch-price:update:refresh-error'");
  });
});
