const normalizeText = (value) => String(value || '').toLowerCase();

const filterReturnableSales = (sales = [], query = '') => {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return Array.isArray(sales) ? sales : [];

  return (Array.isArray(sales) ? sales : []).filter((sale) => [
    sale?.code,
    sale?.customer?.name,
    sale?.customer?.companyName,
    sale?.customer?.phone,
  ].some((value) => normalizeText(value).includes(needle)));
};

export { filterReturnableSales };
export default filterReturnableSales;
