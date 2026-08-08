export const filterReturnableSales = (sales, { search = '', fromDate = '', toDate = '' } = {}) => {
  const query = search.toLowerCase();

  return (Array.isArray(sales) ? sales : []).filter((sale) => {
    const matchSearch =
      !search ||
      (sale.code?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.companyName?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (sale.customer?.phone?.includes(query) ?? false);

    const soldDate = new Date(sale.soldAt);
    const matchDate =
      (!fromDate || new Date(fromDate) <= soldDate) &&
      (!toDate || soldDate <= new Date(toDate));

    return matchSearch && matchDate;
  });
};

export default filterReturnableSales;
