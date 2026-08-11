import {
  formatTaxDate as formatSharedTaxDate,
  formatTaxMoney as formatSharedTaxMoney,
} from '../../presentation/taxPresentation';

export const receiptIdentity = (receipt) => `${receipt.sourceType}:${receipt.sourceId}`;

export const remainingReceiptAmount = (receipt) => Math.max(
  Number(receipt?.remainingTotalAmount
    ?? (Number(receipt?.sourceTotalAmount ?? receipt?.receiptAmount ?? 0)
      - Number(receipt?.allocatedTotalAmount || 0))),
  0,
);

const remainingSourceAmount = (receipt, remainingField, sourceField, allocatedField) => Math.max(
  Number(receipt?.[remainingField]
    ?? (Number(receipt?.[sourceField] || 0) - Number(receipt?.[allocatedField] || 0))),
  0,
);

const roundMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const sourceAmountPrefill = (receipt) => ({
  allocatedSubtotal: remainingSourceAmount(
    receipt,
    'remainingSubtotalAmount',
    'sourceSubtotalAmount',
    'allocatedSubtotal',
  ),
  allocatedVatAmount: remainingSourceAmount(
    receipt,
    'remainingVatAmount',
    'sourceVatAmount',
    'allocatedVatAmount',
  ),
  allocatedTotalAmount: remainingReceiptAmount(receipt),
});

export const receiptAllocationPrefill = (receipt) => {
  const source = sourceAmountPrefill(receipt);
  const policy = receipt?.vatPolicy;
  if (!policy?.autoCalculate) return source;

  const treatment = String(policy.treatment || '').toUpperCase();
  const priceMode = String(policy.priceMode || '').toUpperCase();
  const ratePercent = Number(policy.ratePercent || 0);

  if (['ZERO_RATED', 'EXEMPT', 'NON_VAT'].includes(treatment)) {
    const total = roundMoney(remainingReceiptAmount(receipt));
    return {
      allocatedSubtotal: total,
      allocatedVatAmount: 0,
      allocatedTotalAmount: total,
    };
  }

  if (treatment !== 'STANDARD_RATE' || !Number.isFinite(ratePercent) || ratePercent < 0) {
    return source;
  }

  if (priceMode === 'INCLUSIVE') {
    const total = roundMoney(remainingReceiptAmount(receipt));
    const divisor = 1 + (ratePercent / 100);
    if (divisor <= 0) return source;
    const subtotal = roundMoney(total / divisor);
    return {
      allocatedSubtotal: subtotal,
      allocatedVatAmount: roundMoney(total - subtotal),
      allocatedTotalAmount: total,
    };
  }

  if (priceMode === 'EXCLUSIVE') {
    const subtotal = roundMoney(source.allocatedSubtotal);
    const vat = roundMoney(subtotal * (ratePercent / 100));
    return {
      allocatedSubtotal: subtotal,
      allocatedVatAmount: vat,
      allocatedTotalAmount: roundMoney(subtotal + vat),
    };
  }

  return source;
};

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

const documentCapacityFields = [
  ['subtotalAmount', 'activeAllocatedSubtotal'],
  ['taxAmount', 'activeAllocatedVatAmount'],
  ['totalAmount', 'activeAllocatedTotalAmount'],
];

export const documentCanFitReceiptAllocations = (document, pendingReceipts = []) => {
  const pending = sumReceiptAllocations(pendingReceipts);
  const pendingByLimitField = {
    subtotalAmount: pending.subtotalAmount,
    taxAmount: pending.vatAmount,
    totalAmount: pending.totalAmount,
  };

  return documentCapacityFields.every(([limitField, allocatedField]) => {
    const limit = Number(document?.[limitField] || 0);
    if (limit <= 0) return true;
    const allocated = Number(document?.[allocatedField] || 0);
    const requested = Number(pendingByLimitField[limitField] || 0);
    return allocated + requested <= limit + 0.001;
  });
};

export const remainingDocumentTotalCapacity = (document) => Math.max(
  Number(document?.totalAmount || 0) - Number(document?.activeAllocatedTotalAmount || 0),
  0,
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
