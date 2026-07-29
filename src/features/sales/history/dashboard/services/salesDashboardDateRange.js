const startOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const startOfMonth = (value) => {
  const date = startOfDay(value);
  date.setDate(1);
  return date;
};

const endOfDayExclusive = (value) => {
  const date = startOfDay(value);
  date.setDate(date.getDate() + 1);
  return date;
};

const toISODate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const projectSalesDashboardDateRange = ({
  scope = 'today',
  fromDate,
  toDate,
  now = new Date(),
} = {}) => {
  if (scope === 'custom') {
    return {
      fromDate: fromDate || null,
      toDate: toDate || null,
      monthFromDate: null,
      monthToDate: null,
    };
  }

  const projectedToDate = toISODate(endOfDayExclusive(now));
  return {
    fromDate: toISODate(startOfDay(now)),
    toDate: projectedToDate,
    monthFromDate: toISODate(startOfMonth(now)),
    monthToDate: projectedToDate,
  };
};
