export const getCustomerBaseName = (customer, fallback = '-') => {
  if (!customer) return fallback;
  const organization = customer.type === 'ORGANIZATION' || customer.type === 'GOVERNMENT';
  return (organization
    ? customer.companyName || customer.name
    : customer.name || customer.companyName) || fallback;
};

export const getCustomerDisplayName = (customer, fallback = '-') => {
  const baseName = getCustomerBaseName(customer, fallback);
  const departmentName = String(customer?.departmentName || '').trim();
  if (!departmentName || baseName === fallback) return baseName;
  return `${baseName} · ${departmentName}`;
};
