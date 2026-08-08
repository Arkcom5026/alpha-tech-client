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

  it('projects persisted final sale amounts without subtracting adjustment evidence twice', () => {
    const rows = prepareDeliveryNoteSaleItems({
      items: [
        {
          id: 11,
          stockItemId: 101,
          product: { id: 1, name: 'Phone', unit: { name: 'เครื่อง' } },
          basePrice: 3500,
          price: 3600,
          discount: 0,
        },
      ],
      simpleItems: [
        {
          id: 21,
          product: { id: 2, name: 'Cable', unit: { name: 'เส้น' } },
          quantity: 2,
          basePrice: 200,
          price: 180,
          discount: 20,
        },
      ],
    });

    const phone = rows.find((row) => row.productId === 1);
    expect(phone.quantity).toBe(1);
    expect(phone.price).toBe(3600);
    expect(phone.discount).toBe(0);

    const cable = rows.find((row) => row.productId === 2);
    expect(cable.quantity).toBe(2);
    expect(cable.price).toBe(90);
    expect(cable.discount).toBe(0);

    const documentTotal = rows.reduce((sum, row) => sum + row.price * row.quantity, 0);
    expect(documentTotal).toBe(3780);
  });

  it('does not merge the same product when effective final unit prices differ', () => {
    const rows = prepareDeliveryNoteSaleItems({
      simpleItems: [
        {
          id: 21,
          product: { id: 2, name: 'Cable', unit: { name: 'เส้น' } },
          quantity: 2,
          basePrice: 200,
          price: 180,
          discount: 20,
        },
        {
          id: 22,
          product: { id: 2, name: 'Cable', unit: { name: 'เส้น' } },
          quantity: 3,
          basePrice: 300,
          price: 300,
          discount: 0,
        },
      ],
    });

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.price).sort((a, b) => a - b)).toEqual([90, 100]);
    expect(rows.reduce((sum, row) => sum + row.price * row.quantity, 0)).toBe(480);
  });

  it('supports server saleLines projections using lineAmount as final authority', () => {
    const rows = prepareDeliveryNoteSaleItems({
      saleLines: [
        {
          id: 31,
          lineType: 'SIMPLE',
          description: 'Service package',
          quantity: 2,
          unitAmount: 100,
          discountAmount: 20,
          lineAmount: 220,
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].productName).toBe('Service package');
    expect(rows[0].quantity).toBe(2);
    expect(rows[0].price).toBe(110);
    expect(rows[0].discount).toBe(0);
  });

  it('preserves compatibility for older unit-price projections', () => {
    const rows = prepareDeliveryNoteSaleItems({
      simpleItems: [
        {
          id: 21,
          product: { id: 2, name: 'Cable', unit: { name: 'เส้น' } },
          unitPrice: 100,
          quantity: 2,
          discount: 10,
        },
      ],
    });

    expect(rows).toHaveLength(1);
    expect(rows[0].quantity).toBe(2);
    expect(rows[0].price).toBe(90);
    expect(rows[0].discount).toBe(0);
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
