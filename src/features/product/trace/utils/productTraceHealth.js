const countItems = (value) => (Array.isArray(value) ? value.length : 0);

export const buildProductTraceHealth = ({
  returns = [],
  claims = [],
  repairs = [],
  identity,
} = {}) => {
  const returnCount = countItems(returns);
  const claimCount = countItems(claims);
  const repairCount = countItems(repairs);
  const totalIncidents = returnCount + claimCount + repairCount;
  const status = String(identity?.status || '').toUpperCase();

  if (claimCount >= 2 || repairCount >= 2 || totalIncidents >= 3) {
    return {
      level: 'CRITICAL',
      label: 'ต้องเฝ้าระวัง',
      description: `พบประวัติหลังการขาย ${totalIncidents} เหตุการณ์`,
      className: 'border-rose-200 bg-rose-50 text-rose-700',
    };
  }

  if (claimCount > 0 || repairCount > 0 || returnCount > 0) {
    return {
      level: 'WATCH',
      label: 'มีประวัติหลังการขาย',
      description: [
        returnCount ? `คืน ${returnCount}` : null,
        claimCount ? `เคลม ${claimCount}` : null,
        repairCount ? `ซ่อม ${repairCount}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  if (['DAMAGED', 'LOST', 'CLAIMED'].includes(status)) {
    return {
      level: 'WATCH',
      label: 'สถานะต้องตรวจสอบ',
      description: `สถานะปัจจุบัน ${status || '-'}`,
      className: 'border-amber-200 bg-amber-50 text-amber-700',
    };
  }

  return {
    level: 'HEALTHY',
    label: 'ประวัติปกติ',
    description: 'ยังไม่พบประวัติคืน เคลม หรืองานซ่อม',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
};
