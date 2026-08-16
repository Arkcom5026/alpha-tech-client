import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const filePath = path.resolve('src/features/sales/held-cart/components/PosHeldCartPanel.jsx');
const source = fs.readFileSync(filePath, 'utf8');

describe('Held cart partial-success authority', () => {
  it('keeps synchronous mutation ownership for create/cancel flows', () => {
    expect(source).toContain('const mutationRef = useRef(false);');
    expect(source).toContain('if (saving || mutationRef.current) return;');
    expect(source).toContain('if (cancellingId || mutationRef.current) return;');
  });

  it('snapshots persistent commands before mutation', () => {
    expect(source).toContain('const payload = {');
    expect(source).toContain('const heldCartIdSnapshot = heldCartId;');
    expect(source).toContain('const reasonSnapshot = reason;');
  });

  it('separates post-success refresh failure from persistence failure', () => {
    expect(source).toContain('held-cart:create:refresh:error');
    expect(source).toContain('held-cart:cancel:${heldCartIdSnapshot}:refresh:error');
    expect(source).toContain('บันทึกใบพักสำเร็จแล้ว แต่รีเฟรชรายการใบพักไม่สำเร็จ');
    expect(source).toContain('ยกเลิกใบพักรายการสำเร็จแล้ว แต่รีเฟรชรายการใบพักไม่สำเร็จ');
  });

  it('keeps persistence error keys exclusive to create/cancel failures', () => {
    expect(source).toContain("feedback.actionError(error, getPosHeldCartErrorMessage(error), 'held-cart:create:error');");
    expect(source).toContain('`held-cart:cancel:${heldCartIdSnapshot}:error`');
    expect(source).toContain("feedback.actionSuccess(`บันทึกใบพัก ${cart.code} แล้ว`, 'held-cart:create:success');");
  });
});
