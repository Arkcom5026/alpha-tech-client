const normalize = (value) => String(value || '').trim().toUpperCase();

const safeArray = (value) => (Array.isArray(value) ? value : []);

const differenceInDays = (endValue, startValue = new Date()) => {
  if (!endValue) return null;

  const end = new Date(endValue);
  const start = new Date(startValue);

  if (Number.isNaN(end.getTime()) || Number.isNaN(start.getTime())) return null;

  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
};

export const buildProductTraceWarranty = (trace = {}) => {
  const explicit = trace?.warranty || {};
  const startDate =
    explicit.startDate ||
    explicit.startedAt ||
    trace?.sales?.sale?.soldAt ||
    trace?.identity?.warrantyStartDate ||
    null;

  const endDate =
    explicit.endDate ||
    explicit.expiresAt ||
    trace?.identity?.warrantyEndDate ||
    null;

  const remainingDays =
    explicit.remainingDays ?? differenceInDays(endDate);

  let status = normalize(explicit.status);

  if (!status) {
    if (!endDate) status = 'UNKNOWN';
    else status = remainingDays >= 0 ? 'IN_WARRANTY' : 'OUT_OF_WARRANTY';
  }

  return {
    startDate,
    endDate,
    remainingDays,
    status,
    provider:
      explicit.provider ||
      explicit.providerName ||
      trace?.procurement?.supplier?.name ||
      null,
    source: explicit.source || null,
  };
};

export const buildProductTraceCurrentOwner = (trace = {}) => {
  const explicit = trace?.currentOwner || trace?.ownership?.current || null;

  if (explicit) {
    return {
      type: explicit.type || trace?.identity?.currentCustody || 'UNKNOWN',
      name: explicit.name || explicit.displayName || null,
      phone: explicit.phone || null,
      since: explicit.since || explicit.acquiredAt || null,
      documentCode: explicit.documentCode || null,
    };
  }

  const custody = normalize(trace?.identity?.currentCustody);
  const sale = trace?.sales?.sale;
  const customer = sale?.customer;

  if (custody === 'CUSTOMER' || sale) {
    return {
      type: 'CUSTOMER',
      name: customer?.companyName || customer?.name || 'ลูกค้า',
      phone: customer?.phone || customer?.user?.loginId || null,
      since: sale?.soldAt || null,
      documentCode: sale?.code || null,
    };
  }

  return {
    type: custody || 'STORE',
    name: custody === 'STORE' ? 'ร้านค้า' : null,
    phone: null,
    since: trace?.identity?.receivedAt || null,
    documentCode: trace?.procurement?.receipt?.code || null,
  };
};

export const buildProductTraceEventCounters = (timeline = []) => {
  const result = {
    received: 0,
    ready: 0,
    sold: 0,
    returned: 0,
    claimed: 0,
    repaired: 0,
    transferred: 0,
    damagedOrLost: 0,
  };

  safeArray(timeline).forEach((event) => {
    const type = normalize(event?.type);
    const category = normalize(event?.category);
    const title = normalize(event?.title);

    if (
      category === 'PROCUREMENT' ||
      type.includes('RECEIV') ||
      title.includes('รับสินค้า')
    ) {
      result.received += 1;
    }

    if (type.includes('READY') || title.includes('พร้อมขาย')) {
      result.ready += 1;
    }

    if (category === 'SALES' || type.includes('SOLD') || title.includes('ขาย')) {
      result.sold += 1;
    }

    if (category === 'RETURN' || type.includes('RETURN')) {
      result.returned += 1;
    }

    if (category === 'CLAIM' || type.includes('CLAIM')) {
      result.claimed += 1;
    }

    if (category === 'REPAIR' || type.includes('REPAIR')) {
      result.repaired += 1;
    }

    if (type.includes('TRANSFER') || title.includes('โอน')) {
      result.transferred += 1;
    }

    if (
      type.includes('DAMAGED') ||
      type.includes('LOST') ||
      title.includes('ชำรุด') ||
      title.includes('สูญหาย')
    ) {
      result.damagedOrLost += 1;
    }
  });

  return result;
};

export const buildProductTraceRisk = ({
  identity,
  returns = [],
  claims = [],
  repairs = [],
  timeline = [],
} = {}) => {
  const counters = buildProductTraceEventCounters(timeline);
  const returnCount = safeArray(returns).length || counters.returned;
  const claimCount = safeArray(claims).length || counters.claimed;
  const repairCount = safeArray(repairs).length || counters.repaired;
  const damageCount = counters.damagedOrLost;
  const status = normalize(identity?.status);

  let score =
    returnCount * 2 +
    claimCount * 3 +
    repairCount * 2 +
    damageCount * 4;

  if (['DAMAGED', 'LOST'].includes(status)) score += 5;
  if (status === 'CLAIMED') score += 2;

  if (score >= 8) {
    return {
      level: 'HIGH',
      label: 'ความเสี่ยงสูง',
      score,
      description: 'มีเหตุคืน เคลม ซ่อม หรือความเสียหายหลายครั้ง',
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  if (score >= 3) {
    return {
      level: 'MEDIUM',
      label: 'ควรเฝ้าระวัง',
      score,
      description: 'พบเหตุการณ์ที่ควรติดตามเพิ่มเติม',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    level: 'LOW',
    label: 'ความเสี่ยงต่ำ',
    score,
    description: 'ยังไม่พบรูปแบบเหตุการณ์ที่มีความเสี่ยง',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
};

export const buildProductTraceOperationalSummary = (trace = {}) => {
  const identity = trace?.identity || {};
  const returns = safeArray(trace?.returns);
  const claims = safeArray(trace?.claims);
  const repairs = safeArray(trace?.repairs);
  const risk = buildProductTraceRisk({
    identity,
    returns,
    claims,
    repairs,
    timeline: trace?.timeline,
  });

  const sentences = [];

  if (identity.status) {
    sentences.push(`สถานะปัจจุบัน ${identity.status}`);
  }

  if (identity.currentCustody === 'CUSTOMER') {
    sentences.push('สินค้าอยู่กับลูกค้า');
  }

  if (!returns.length && !claims.length && !repairs.length) {
    sentences.push('ยังไม่พบประวัติคืน เคลม หรือซ่อม');
  } else {
    if (returns.length) sentences.push(`คืนสินค้า ${returns.length} ครั้ง`);
    if (claims.length) sentences.push(`เคลม ${claims.length} ครั้ง`);
    if (repairs.length) sentences.push(`ซ่อม ${repairs.length} ครั้ง`);
  }

  if (trace?.summary?.grossMarginPercentAfterRefund !== null &&
      trace?.summary?.grossMarginPercentAfterRefund !== undefined) {
    sentences.push(
      `Margin หลังคืน ${Number(
        trace.summary.grossMarginPercentAfterRefund
      ).toFixed(2)}%`
    );
  }

  sentences.push(`ระดับความเสี่ยง ${risk.level}`);

  return {
    sentences,
    risk,
  };
};
