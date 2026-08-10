import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const header = read('src/features/repair/components/RepairShellHeader.jsx');
const helpCenter = read('src/features/repair/help/RepairHelpCenter.jsx');
const content = read('src/features/repair/help/repairHelpContent.js');

describe('Repair in-app help center contract', () => {
  it('exposes the help center from the repair shell', () => {
    expect(header).toContain("import RepairHelpCenter from '../help/RepairHelpCenter'");
    expect(header).toContain('คู่มือ');
    expect(header).toContain('aria-haspopup="dialog"');
    expect(header).toContain('<RepairHelpCenter');
  });

  it('renders an accessible contextual help dialog', () => {
    expect(helpCenter).toContain('role="dialog"');
    expect(helpCenter).toContain('aria-modal="true"');
    expect(helpCenter).toContain("event.key === 'Escape'");
    expect(helpCenter).toContain("document.body.style.overflow = 'hidden'");
    expect(helpCenter).toContain('ค้นหาในคู่มือ');
    expect(helpCenter).toContain('inferRepairHelpSection(location.pathname)');
  });

  it('covers every repair workflow section and route context', () => {
    for (const sectionId of [
      'overview',
      'intake',
      'queue',
      'estimate',
      'claim',
      'control-center',
      'tracking',
      'handover',
      'troubleshooting',
    ]) {
      expect(content, `Missing repair guide section: ${sectionId}`).toContain(`id: '${sectionId}'`);
    }

    expect(content).toContain("pathname.includes('repair-intake')");
    expect(content).toContain("pathname.includes('warranty-claims')");
    expect(content).toContain("pathname.includes('/repairs')");
  });

  it('documents the flexible workflow instead of stale mandatory gates', () => {
    expect(content).toContain('รูปสภาพเครื่องเป็นตัวเลือก');
    expect(content).toContain('ตกลงราคาและขอบเขตงานแล้ว');
    expect(content).toContain('การเสนอราคาเป็น capability ที่เลือกใช้ตามบริบท');
    expect(content).toContain('ชื่อผู้ส่งซ่อมเป็นค่าเริ่มต้น');
    expect(content).toContain("['WAITING_DIAGNOSIS', 'รอตรวจสอบ'");
    expect(content).toContain("['DIAGNOSING', 'กำลังตรวจสอบ'");
    expect(content).not.toContain('วินิจฉัย');
    expect(content).not.toContain('หากไม่มีความยินยอมและรูปสภาพเครื่องตอนรับเข้า');
  });
});
