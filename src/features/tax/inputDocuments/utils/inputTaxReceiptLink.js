import {
  formatTaxDate as formatSharedTaxDate,
  formatTaxMoney as formatSharedTaxMoney,
} from '../../presentation/taxPresentation';

export const receiptIdentity = (receipt) => `${receipt.sourceType}:${receipt.sourceId}`;

export const remainingReceiptAmount = (receipt) => Math.max(
  Number(receipt?.receiptAmount || 0) - Number(receipt?.allocatedTotalAmount || 0),
  0,
);

const allocationFields = [
  ['subtotalAmount', 'allocatedSubtotal'],
  ['vatAmount', 'allocatedVatAmount'],
  ['totalAmount', 'allocatedTotalAmount'],
];

export const sumReceiptAllocations = (items = []) => allocationFields.reduce(
  (totals, [totalField, allocationField]) => ({
    ...totals,
    [totalField]: items.reduce(
      (sum, item) => sum + Number(item?.[allocationField] || 0),
      0,
    ),
  }),
  {},
);

export const projectDocumentAllocation = ({ document, activeLinks, pendingReceipts }) => {
  const limits = {
    subtotalAmount: Number(document?.subtotalAmount || 0),
    vatAmount: Number(document?.taxAmount || 0),
    totalAmount: Number(document?.totalAmount || 0),
  };
  const existing = sumReceiptAllocations(
    (activeLinks || []).filter((link) => link.state === 'ACTIVE'),
  );
  const pending = sumReceiptAllocations(pendingReceipts || []);
  const projected = {};
  const remaining = {};
  let overflow = false;

  allocationFields.forEach(([field]) => {
    projected[field] = existing[field] + pending[field];
    remaining[field] = limits[field] > 0
      ? limits[field] - projected[field]
      : null;
    if (limits[field] > 0 && projected[field] > limits[field] + 0.001) {
      overflow = true;
    }
  });

  return {
    limits,
    existing,
    pending,
    projected,
    remaining,
    overflow,
  };
};

export const formatTaxMoney = formatSharedTaxMoney;
export const formatTaxDate = formatSharedTaxDate;

export const linkStateLabel = {
  ACTION_REQUIRED: 'ต้องดำเนินการ',
  UNLINKED: 'ยังไม่ผูก',
  PARTIALLY_LINKED: 'ผูกบางส่วน',
  LINKED: 'ผูกครบแล้ว',
};

export const sourceTypeLabel = {
  PO_RECEIPT: 'รับตาม PO',
  QUICK_RECEIPT: 'รับด่วน',
};
