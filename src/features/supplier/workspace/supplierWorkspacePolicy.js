const DEFAULT_SUPPLIER_SHOP_SLUG = 'advancetech';

const SUPPLIER_CREATE_DEFAULT_VALUES = Object.freeze({
  name: '',
  phone: '',
  email: '',
  taxId: '',
  address: '',
  province: '',
  postalCode: '',
  country: 'Thailand',
  contactPerson: '',
  bankId: '',
  accountNumber: '',
  accountType: '',
  creditLimit: 0,
  creditBalance: 0,
  paymentTerms: 0,
  notes: '',
});

const resolveSupplierShopSlug = (shopSlug) =>
  String(shopSlug || '').trim() || DEFAULT_SUPPLIER_SHOP_SLUG;

const createSupplierPaths = (shopSlug) => {
  const targetSlug = resolveSupplierShopSlug(shopSlug);
  const list = `/${targetSlug}/pos/purchases/suppliers`;

  return Object.freeze({
    list,
    create: `${list}/create`,
    view: (id) => `${list}/view/${id}`,
    edit: (id) => `${list}/edit/${id}`,
  });
};

const normalizeSupplierMutationPayload = (formData = {}) => ({
  ...formData,
  creditLimit: parseFloat(formData.creditLimit || 0),
  creditBalance: parseFloat(formData.creditBalance || 0),
  paymentTerms: parseInt(formData.paymentTerms || 0, 10),
  notes: formData.notes || null,
});

const normalizeSupplierForForm = (supplier) => {
  if (!supplier || typeof supplier !== 'object') return supplier;

  const normalized = { ...supplier };
  if (normalized.bankId !== null && typeof normalized.bankId !== 'string') {
    normalized.bankId = normalized.bankId.toString();
  }
  return normalized;
};

const sanitizeLegacySupplierUpdatePayload = (formData = {}) => {
  const cleanedForm = { ...formData };
  delete cleanedForm.branchId;
  delete cleanedForm.createdAt;
  delete cleanedForm.updatedAt;
  return cleanedForm;
};

const filterSuppliersBySearch = (suppliers = [], search = '') => {
  const keyword = String(search || '').trim().toLocaleLowerCase('th-TH');
  if (!keyword) return suppliers;

  return suppliers.filter((supplier) =>
    [supplier?.name, supplier?.phone, supplier?.email]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase('th-TH').includes(keyword)),
  );
};

const getSupplierPagination = ({ total = 0, page = 1, limit = 20 } = {}) => {
  const safeLimit = Number(limit) || 20;
  const totalPages = Math.max(1, Math.ceil(Number(total || 0) / safeLimit));
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const startIndex = (safePage - 1) * safeLimit;

  return Object.freeze({
    totalPages,
    safePage,
    startIndex,
    endIndex: Math.min(startIndex + safeLimit, Number(total || 0)),
  });
};

export {
  DEFAULT_SUPPLIER_SHOP_SLUG,
  SUPPLIER_CREATE_DEFAULT_VALUES,
  createSupplierPaths,
  filterSuppliersBySearch,
  getSupplierPagination,
  normalizeSupplierForForm,
  normalizeSupplierMutationPayload,
  resolveSupplierShopSlug,
  sanitizeLegacySupplierUpdatePayload,
};
