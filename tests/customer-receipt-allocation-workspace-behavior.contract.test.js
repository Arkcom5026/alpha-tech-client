import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('customer receipt allocation workspace behavior contract', () => {
  const page = read('src/features/customerReceipt/pages/CustomerReceiptAllocatePage.jsx');

  it('keeps receipt detail and candidate loading scoped to the selected receipt', () => {
    expect(page).toContain('const receipt = await getCustomerReceiptByIdAction(Number(id)).catch(() => null);');
    expect(page).toContain('if (receipt?.customerId) {');
    expect(page).toContain('await loadAllocationCandidateSalesAction(receipt.id, {');
    expect(page).toContain('page: 1,');
    expect(page).toContain('limit: 50,');
  });

  it('cleans receipt messages, selected receipt, and candidate state on lifecycle exit', () => {
    expect(page).toContain('clearCustomerReceiptMessagesAction();');
    expect(page).toContain('clearSelectedCustomerReceiptAction();');
    expect(page).toContain('clearAllocationCandidatesAction();');
  });

  it('preserves multi-allocation sequencing and ignores invalid allocation rows', () => {
    expect(page).toContain('if (Array.isArray(allocations) && allocations.length > 0) {');
    expect(page).toContain('for (const allocation of allocations) {');
    expect(page).toContain('const nextSaleId = Number(allocation?.saleId);');
    expect(page).toContain('const nextAmount = Number(allocation?.amount || 0);');
    expect(page).toContain('if (!nextSaleId || nextAmount <= 0) continue;');
    expect(page).toContain('note: allocation?.note ?? note ?? null,');
  });

  it('preserves single-allocation fallback through the same store authority', () => {
    expect(page).toContain('result = await allocateCustomerReceiptAction({');
    expect(page).toContain('receiptId,');
    expect(page).toContain('saleId,');
    expect(page).toContain('amount,');
    expect(page).toContain('note,');
  });

  it('refreshes receipt and candidate state before navigating to print', () => {
    expect(page).toContain('await getCustomerReceiptByIdAction(receiptId).catch(() => null);');
    expect(page).toContain('await loadAllocationCandidateSalesAction(receiptId, {');
    expect(page).toContain('navigate(buildReceiptPath(`/${result?.receipt?.id || receiptId}/print`));');
  });

  it('keeps allocation capability and finance-context navigation semantics intact', () => {
    expect(page).toContain("selectedItem?.status !== 'CANCELLED' && Number(selectedItem?.remainingAmount || 0) > 0");
    expect(page).toContain('const receiptListPath = shopSlug');
    expect(page).toContain('`/${shopSlug}/pos/finance/customer-receipts`');
    expect(page).toContain("'/pos/finance/customer-receipts'");
    expect(page).toContain('onSubmit={handleAllocate}');
  });
});
