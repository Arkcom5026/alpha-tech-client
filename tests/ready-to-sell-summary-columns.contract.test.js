import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('ready-to-sell summary columns contract', () => {
  const table = read('src/features/product/components/ReadyToSellTable.jsx');

  it('keeps only operationally useful summary columns', () => {
    expect(table).toContain('>โหมด</th>');
    expect(table).toContain('>จำนวน</th>');
    expect(table).toContain('>รหัส</th>');
    expect(table).toContain('>ชื่อสินค้า</th>');
    expect(table).toContain('>แบรนด์</th>');
    expect(table).toContain('>สถานะ</th>');
    expect(table).toContain('>รับเข้า</th>');
    expect(table).toContain('>รายละเอียด</th>');
  });

  it('does not render empty type or sell-price columns', () => {
    expect(table).not.toContain('>ประเภท</th>');
    expect(table).not.toContain('>ราคาขาย</th>');
    expect(table).not.toContain('formatMoney');
    expect(table).not.toContain('sellPrice');
    expect(table).not.toContain('productTypeName');
  });

  it('widens product name and keeps empty-state span aligned', () => {
    expect(table).toContain('min-w-[320px]');
    expect(table).toContain('colSpan={8}');
  });
});
