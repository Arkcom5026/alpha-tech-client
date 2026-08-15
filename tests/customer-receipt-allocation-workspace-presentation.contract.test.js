import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const header = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationHeader.jsx');
const messages = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationMessages.jsx');
const body = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationBody.jsx');
const aside = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationAside.jsx');
const presentation = [header, messages, body, aside].join('\n');

describe('customer receipt allocation workspace presentation contract', () => {
  it('keeps extracted workspace components presentation-only', () => {
    expect(presentation).not.toContain('useCustomerReceiptStore');
    expect(presentation).not.toContain('getCustomerReceiptByIdAction');
    expect(presentation).not.toContain('loadAllocationCandidateSalesAction');
    expect(presentation).not.toContain('allocateCustomerReceiptAction');
    expect(presentation).not.toContain('useNavigate');
    expect(presentation).not.toContain('useParams');
  });

  it('preserves allocation header capability feedback and finance navigation', () => {
    expect(header).toContain('รายการรับชำระลูกหนี้');
    expect(header).toContain('ตัดชำระใบรับเงิน');
    expect(header).toContain('ใบรับเงินนี้ไม่สามารถตัดชำระเพิ่มได้แล้ว');
    expect(header).toContain('receiptListPath');
  });

  it('preserves loading, not-found, receipt detail, and allocation form presentation', () => {
    expect(body).toContain('animate-pulse');
    expect(body).toContain('ไม่พบข้อมูลใบรับเงิน');
    expect(body).toContain('CustomerReceiptDetailCard');
    expect(body).toContain('CustomerReceiptAllocateForm');
    expect(body).toContain('candidatesSummary.totalItems');
    expect(body).toContain('const handleSubmit = async (payload) =>');
    expect(body).toContain('onSubmit={handleSubmit}');
    expect(body).toContain('feedback.actionSuccess');
    expect(body).toContain('feedback.actionError');
  });

  it('preserves operational messages, guidance, and shortcuts', () => {
    expect(messages).toContain('role="alert"');
    expect(messages).toContain('role="status"');
    expect(aside).toContain('คำแนะนำการตัดชำระ');
    expect(aside).toContain('ระบบจะ rollback allocation ของใบนี้ทั้งหมด');
    expect(aside).toContain('กลับหน้ารายละเอียดใบรับเงิน');
    expect(aside).toContain('กลับไปรายการทั้งหมด');
  });
});
