export const receiptIdentity = (receipt) => `${receipt.sourceType}:${receipt.sourceId}`;

export const remainingReceiptAmount = (receipt) => Math.max(
  Number(receipt?.receiptAmount || 0) - Number(receipt?.allocatedTotalAmount || 0),
  0,
);

export const formatTaxMoney = (value) => new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 2,
}).format(Number(value || 0));

export const formatTaxDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
};

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
