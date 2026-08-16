import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Quick Receipt mutation authority', () => {
  it('owns persistent session mutations synchronously across the first render gap', () => {
    const source = read('src/features/receiving/quick-stock/session/useQuickReceiptSessionController.js');

    expect(source).toContain("import { useEffect, useMemo, useRef, useState } from 'react'");
    expect(source).toContain('const busyRef = useRef(false)');
    expect(source).toContain('if (isBusy || busyRef.current) return false');
    expect(source).toContain('busyRef.current = true');
    expect(source).toContain('busyRef.current = false');
    expect(source).toContain('const draftIdSnapshot = draft?.id');
    expect(source).toContain('const receiptIdSnapshot = receipt?.id');
    expect(source).toContain('const itemIdSnapshot = itemId');
  });

  it('does not report a committed mutation as failed when only the draft refresh fails', () => {
    const source = read('src/features/receiving/quick-stock/session/useQuickReceiptSessionController.js');

    expect(source).toContain('บันทึกรายการรับต่อภายหลังสำเร็จแล้ว แต่รีเฟรชรายการฉบับร่างไม่สำเร็จ');
    expect(source).toContain('รับสินค้าเข้าสต๊อกสำเร็จแล้ว แต่รีเฟรชรายการฉบับร่างไม่สำเร็จ');
    expect(source).toContain('ยกเลิกรายการรับสินค้าด่วนสำเร็จแล้ว แต่รีเฟรชรายการฉบับร่างไม่สำเร็จ');
    expect(source).toContain('save-for-later:refresh:error');
    expect(source).toContain('finalize:refresh:error');
    expect(source).toContain('cancel:refresh:error');
    expect(source).toContain('feedback.actionSuccess');
    expect(source).toContain('feedback.actionError');
  });

  it('uses action feedback for resume failures instead of a generic transient error', () => {
    const source = read('src/features/receiving/quick-stock/session/useQuickReceiptSessionController.js');

    expect(source).toContain("`quick-receipt:${draftIdSnapshot}:resume:error`");
    expect(source).toContain("'เปิดรายการรับต่อไม่สำเร็จ'");
  });
});
