const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const formatProductTraceMoney = (value, fallback = '-') => {
  const number = toNumberOrNull(value);
  if (number === null) return fallback;

  return `${number.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ฿`;
};

export const formatProductTracePercent = (value, fallback = '-') => {
  const number = toNumberOrNull(value);
  if (number === null) return fallback;

  return `${number.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

export const formatProductTraceDateTime = (value, fallback = '-') => {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatProductTraceDate = (value, fallback = '-') => {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const resolveProductTraceCustomerName = (customer) =>
  customer?.companyName || customer?.name || '-';

export const resolveProductTraceProductName = (identity) =>
  identity?.product?.name || 'ไม่พบชื่อสินค้า';
