import apiClient from '@/utils/apiClient';

const unwrapData = (response) => response?.data?.data ?? response?.data;

const requirePositiveId = (value, fieldName) => {
  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized <= 0) {
    const error = new Error(`${fieldName} ไม่ถูกต้อง`);
    error.code = 'TAX_EXPENSE_CLIENT_VALIDATION_ERROR';
    throw error;
  }
  return normalized;
};

const toParams = (branchId, filters = {}) => ({
  branchId: requirePositiveId(branchId, 'branchId'),
  ...(filters.status ? { status: String(filters.status).trim().toUpperCase() } : {}),
  ...(filters.supplierId ? { supplierId: requirePositiveId(filters.supplierId, 'supplierId') } : {}),
  ...(filters.documentNumber ? { documentNumber: String(filters.documentNumber).trim() } : {}),
  ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
  ...(filters.toDate ? { toDate: filters.toDate } : {}),
});

export const listTaxExpenseCategories = async ({ branchId, activeOnly = true } = {}) => {
  const response = await apiClient.get('/tax/expense-categories', {
    params: { branchId: requirePositiveId(branchId, 'branchId'), activeOnly },
  });
  return unwrapData(response);
};

export const createTaxExpenseCategory = async ({ branchId, code, name } = {}) => {
  const response = await apiClient.post('/tax/expense-categories', {
    branchId: requirePositiveId(branchId, 'branchId'),
    code,
    name,
  });
  return unwrapData(response);
};

export const listTaxExpenses = async ({ branchId, ...filters } = {}) => {
  const response = await apiClient.get('/tax/expenses', { params: toParams(branchId, filters) });
  return unwrapData(response);
};

export const getTaxExpenseDetail = async ({ branchId, taxExpenseId } = {}) => {
  const response = await apiClient.get(`/tax/expenses/${requirePositiveId(taxExpenseId, 'taxExpenseId')}`, {
    params: { branchId: requirePositiveId(branchId, 'branchId') },
  });
  return unwrapData(response);
};

export const createTaxExpense = async ({ branchId, ...payload } = {}) => {
  const response = await apiClient.post('/tax/expenses', {
    ...payload,
    branchId: requirePositiveId(branchId, 'branchId'),
  });
  return unwrapData(response);
};

export const recordTaxExpense = async ({ branchId, taxExpenseId } = {}) => {
  const response = await apiClient.post(`/tax/expenses/${requirePositiveId(taxExpenseId, 'taxExpenseId')}/record`, {
    branchId: requirePositiveId(branchId, 'branchId'),
  });
  return unwrapData(response);
};

export const getTaxExpenseErrorMessage = (error) => (
  error?.response?.data?.message
  || error?.response?.data?.error?.message
  || error?.message
  || 'ไม่สามารถดำเนินการรายการค่าใช้จ่ายได้'
);
