const KEY = 'alpha-tech:sale-customer-first-association';

export const storeSaleCustomerFirstAssociation = ({ customerId, token } = {}) => {
  if (typeof window === 'undefined') return;
  if (!customerId || !token) {
    window.sessionStorage.removeItem(KEY);
    return;
  }
  window.sessionStorage.setItem(KEY, JSON.stringify({ customerId: Number(customerId), token }));
};

export const readSaleCustomerFirstAssociation = (customerId) => {
  if (typeof window === 'undefined' || !customerId) return null;
  try {
    const value = JSON.parse(window.sessionStorage.getItem(KEY) || 'null');
    return Number(value?.customerId) === Number(customerId) ? value?.token || null : null;
  } catch {
    return null;
  }
};

export const clearSaleCustomerFirstAssociation = () => {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(KEY);
};
