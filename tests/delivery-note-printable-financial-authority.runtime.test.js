import assert from 'node:assert/strict';
import {
  calculatePrintableDocumentTotal,
  resolveDeliveryNotePrintableSale,
} from '../src/features/deliveryNote/print/workspace/policies/deliveryNoteFinancialAuthority.js';

const sale = Object.freeze({ id: 1059, totalAmount: 5000, vatRate: 7 });
const preparationItems = [
  { quantity: 40, price: 100 },
];

assert.equal(calculatePrintableDocumentTotal(preparationItems), 4000);

const lockedPreparationSale = resolveDeliveryNotePrintableSale({
  sale,
  printableItems: preparationItems,
  preparationStatus: 'LOCKED',
  replacementAuthorityActive: false,
});
assert.equal(lockedPreparationSale.totalAmount, 4000);
assert.equal(sale.totalAmount, 5000, 'source sale authority must remain unchanged');

const draftPreparationSale = resolveDeliveryNotePrintableSale({
  sale,
  printableItems: preparationItems,
  preparationStatus: 'DRAFT',
  replacementAuthorityActive: false,
});
assert.equal(draftPreparationSale, sale, 'draft preparation must not override sale financial authority');

const replacementSale = resolveDeliveryNotePrintableSale({
  sale,
  printableItems: [
    { quantity: 25, price: 100 },
    { quantity: 15, price: 100 },
  ],
  preparationStatus: 'LOCKED',
  replacementAuthorityActive: true,
});
assert.equal(replacementSale.totalAmount, 4000);
assert.equal(sale.totalAmount, 5000, 'replacement projection must not mutate source sale authority');

console.log('Delivery note printable financial authority runtime test: PASS');
