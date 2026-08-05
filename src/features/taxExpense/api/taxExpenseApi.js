import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listTaxExpenseCategories = async () =>
  unwrap(await apiClient.get('/tax-expenses/categories'));

export const createTaxExpenseCategory = async (payload) =>
  unwrap(await apiClient.post('/tax-expenses/categories', payload));

export const listExpensePayeeSuppliers = async ({ q } = {}) =>
  unwrap(await apiClient.get('/tax-expenses/expense-payees', { params: q ? { q } : undefined }));

export const listTaxExpenseSupplierCandidates = async ({ q } = {}) =>
  unwrap(await apiClient.get('/tax-expenses/setup/suppliers', { params: q ? { q } : undefined }));

export const enableSupplierAsExpensePayee = async (supplierId) =>
  unwrap(await apiClient.post(`/tax-expenses/setup/suppliers/${supplierId}/expense-payee`));

export const listTaxExpenses = async ({ status, fromDate, toDate, q } = {}) =>
  unwrap(await apiClient.get('/tax-expenses', {
    params: {
      ...(status ? { status } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {}),
      ...(q ? { q } : {}),
    },
  }));

export const createTaxExpense = async (payload) =>
  unwrap(await apiClient.post('/tax-expenses', payload));
