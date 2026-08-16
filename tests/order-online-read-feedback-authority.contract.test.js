import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('Order Online read feedback authority', () => {
  it('surfaces list and detail read failures without replacing current data', () => {
    const store = read('src/features/orderOnline/store/orderOnlineStore.js');

    expect(store).toContain("import { feedback } from '@/design-system/feedback'");
    expect(store).toContain("orderError: ''");
    expect(store).toContain("feedback.error(message)");
    expect(store).toContain("'โหลดรายการคำสั่งซื้อไม่สำเร็จ'");
    expect(store).toContain("'โหลดคำสั่งซื้อของลูกค้าไม่สำเร็จ'");
    expect(store).toContain("'โหลดรายละเอียดคำสั่งซื้อไม่สำเร็จ'");
    expect(store).toContain('return null;');
  });
});
