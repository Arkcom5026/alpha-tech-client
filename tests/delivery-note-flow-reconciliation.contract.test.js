import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath) => fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');

describe('Delivery Note flow reconciliation contract', () => {
  it('keeps credit Delivery Note primary and cash companion independent of receipt/tax format', () => {
    const options = read('src/features/sales/create/components/BillPrintOptions.jsx');
    const confirmation = read('src/features/sales/create/payment/controllers/salePaymentConfirmationController.js');

    expect(options).toContain("value: PRINT_OPTION.DELIVERY_NOTE, label: 'ใบส่งสินค้า'");
    expect(options).toContain('การขายแบบเครดิตใช้ใบส่งสินค้าเป็นเอกสารหลัก');
    expect(options).toContain('{isCash ? (');
    expect(options).toContain('ออกใบส่งของเพิ่มเติม');
    expect(options).not.toContain("isCash && option.value === PRINT_OPTION.ORDINARY_RECEIPT");

    expect(confirmation).toContain("saleMode === 'CREDIT' ? 'PRINT' : includeDeliveryNote ? 'PRINT' : undefined");
  });

  it('supports idempotent Delivery Note creation from paid bill history', () => {
    const api = read('src/features/sales/documents/workspace/api/saleDocumentWorkspaceApi.js');
    const page = read('src/features/bill/pages/PrintBillListPage.jsx');
    const table = read('src/features/bill/components/workspace/BillResultTable.jsx');

    expect(api).toContain('apiClient.post(`/sales/${saleId}/delivery-note`)');
    expect(page).toContain('issueSaleDeliveryNote({ saleId: sourceId })');
    expect(page).toContain('row?.officialDocumentNumber');
    expect(page).toContain('../delivery-note/print/${sourceId}');
    expect(page).toContain('CONSOLIDATED_DOCUMENT_SOURCE_TYPE');
    expect(table).toContain("hasDeliveryNote ? 'ใบส่งของ' : 'สร้างใบส่งของ'");
    expect(table).toContain('deliveryBusyId');
  });
});
