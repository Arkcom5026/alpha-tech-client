import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const page = read('src/features/customerReceipt/pages/CustomerReceiptAllocatePage.jsx');
const header = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationHeader.jsx');
const messages = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationMessages.jsx');
const body = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationBody.jsx');
const aside = read('src/features/customerReceipt/allocation/workspace/components/CustomerReceiptAllocationAside.jsx');
const presentation = [header, messages, body, aside].join('\n');

describe('customer receipt allocation workspace cutover contract', () => {
  it('composes allocation presentation from workspace owners', () => {
    expect(page).toContain('CustomerReceiptAllocationHeader');
    expect(page).toContain('CustomerReceiptAllocationMessages');
    expect(page).toContain('CustomerReceiptAllocationBody');
    expect(page).toContain('CustomerReceiptAllocationAside');
    expect(page).not.toContain('CustomerReceiptDetailCard');
    expect(page).not.toContain('CustomerReceiptAllocateForm');
  });

  it('keeps allocation data and mutation authority in the page', () => {
    expect(page).toContain('useCustomerReceiptStore');
    expect(page).toContain('getCustomerReceiptByIdAction');
    expect(page).toContain('loadAllocationCandidateSalesAction');
    expect(page).toContain('allocateCustomerReceiptAction');
    expect(page).toContain('const handleAllocate = async');
    expect(page).toContain('navigate(buildReceiptPath(`/${result?.receipt?.id || receiptId}/print`));');
  });

  it('keeps workspace presentation free of receipt store and navigation authority', () => {
    expect(presentation).not.toContain('useCustomerReceiptStore');
    expect(presentation).not.toContain('allocateCustomerReceiptAction');
    expect(presentation).not.toContain('loadAllocationCandidateSalesAction');
    expect(presentation).not.toContain('getCustomerReceiptByIdAction');
    expect(presentation).not.toContain('useNavigate');
    expect(presentation).not.toContain('useParams');
  });

  it('preserves capability, messages, form intent, and finance shortcuts through props', () => {
    expect(page).toContain('canAllocate={canAllocate}');
    expect(page).toContain('error={error}');
    expect(page).toContain('successMessage={successMessage}');
    expect(page).toContain('onSubmit={handleAllocate}');
    expect(page).toContain('receiptDetailPath={buildReceiptPath(`/${selectedItem.id}`)}');
    expect(body).toContain('CustomerReceiptAllocateForm');
    expect(aside).toContain('กลับหน้ารายละเอียดใบรับเงิน');
    expect(aside).toContain('กลับไปรายการทั้งหมด');
  });
});
