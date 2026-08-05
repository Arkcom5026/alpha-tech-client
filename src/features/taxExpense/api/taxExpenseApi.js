import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;

export const listTaxExpenseCategories = async () =>
  unwrap(await apiClient.get('/tax-expenses/categories'));

export const createTaxExpenseCategory = async (payload) =>
  unwrap(await apiClient.post('/tax-expenses/categories', payload));

export const listExpensePayees = async ({ q } = {}) =>
  unwrap(await apiClient.get('/tax-expenses/expense-payees', { params: q ? { q } : undefined }));

export const createExpensePayee = async (payload) =>
  unwrap(await apiClient.post('/tax-expenses/expense-payees', payload));

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
