import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildDeliveryNoteBranchConfig,
  buildDeliveryNoteDocumentLine,
  prepareDeliveryNoteSaleItems,
  resolveDeliveryNoteSourceItems,
} from '../src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js';

const root = process.cwd();
const policyPath = 'src/features/deliveryNote/print/workspace/policies/deliveryNotePrintPolicy.js';
const policy = fs.readFileSync(path.join(root, policyPath), 'utf8');

describe('delivery note print workspace policy contract', () => {
  it('keeps the print projection policy pure and runtime-independent', () => {
    expect(policy).not.toContain('react');
    expect(policy).not.toContain('useState');
    expect(policy).not.toContain('useEffect');
    expect(policy).not.toContain('loadSaleDocument');
    expect(policy).not.toContain('useSaleDocumentLineEditor');
    expect(policy).not.toContain('DeliveryNoteForm');
  });

  it('preserves saleLines authority with items and simpleItems fallback', () => {
    const saleLines = [{ id: 1 }];
    expect(resolveDeliveryNoteSourceItems({ saleLines, items: [{ id: 2 }], simpleItems: [{ id: 3 }] }))
      .toBe(saleLines);
    expect(resolveDeliveryNoteSourceItems({ saleLines: [], items: [{ id: 2 }], simpleItems: [{ id: 3 }] }))
      .toEqual([{ id: 2 }, { id: 3 }]);
  });

  it('preserves document-description fallback and printable line identity', () => {
    expect(buildDeliveryNoteDocumentLine({
      documentPrefix: '  รุ่น ',
      documentDescription: ' ',
      documentSuffix: ' สีดำ  ',
      product: { name: 'Notebook' },
    })).toEqual({
      documentPrefix: 'รุ่น',
      documentDescriptionRaw: '',
      documentDescription: 'Notebook',
      documentSuffix: 'สีดำ',
    });
  });

  it('preserves SN and simple-item aggregation semantics', () => {
    const rows = prepareDeliveryNoteSaleItems({
      items: [
        { id: 11, stockItemId: 101, product: { id: 1, name: 'Phone', unit: { name: 'เครื่อง' } }, price: 12000 },
        { id: 12, stockItemId: 102, product: { id: 1, name: 'Phone', unit: { name: 'เครื่อง' } }, price: 12000 },
      ],
      simpleItems: [
        { id: 21, product: { id: 2, name: 'Cable', unit: { name: 'เส้น' } }, unitPrice: 100, quantity: 2, discount: 10 },
        { id: 22, product: { id: 2, name: 'Cable', unit: { name: 'เส้น' } }, unitPrice: 100, quantity: 3, discountAmount: 5 },
      ],
    });

    expect(rows).toHaveLength(2);

    const phone = rows.find((row) => row.productId === 1);
    expect(phone.quantity).toBe(2);
    expect(phone.discount).toBe(0);
    expect(phone.price).toBe(12000);
    expect(phone.saleItemIds).toEqual([11, 12]);
    expect(phone.simpleItemIds).toEqual([]);

    const cable = rows.find((row) => row.productId === 2);
    expect(cable.quantity).toBe(5);
    expect(cable.discount).toBe(15);
    expect(cable.price).toBe(100);
    expect(cable.saleItemIds).toEqual([]);
    expect(cable.simpleItemIds).toEqual([21, 22]);
  });

  it('preserves branch identity, address projection, and tax fallback', () => {
    expect(buildDeliveryNoteBranchConfig({
      branchTaxId: 'fallback-tax',
      branch: {
        companyName: 'บริษัท ทดสอบ จำกัด',
        address: '99/1',
        phone: '020000000',
        subdistrict: {
          nameTh: 'บางรัก',
          postcode: '10500',
          district: {
            nameTh: 'บางรัก',
            province: { nameTh: 'กรุงเทพมหานคร' },
          },
        },
      },
    })).toEqual({
      branchName: 'บริษัท ทดสอบ จำกัด',
      address: '99/1 ต.บางรัก อ.บางรัก จ.กรุงเทพมหานคร 10500',
      phone: '020000000',
      taxId: 'fallback-tax',
    });
  });
});
