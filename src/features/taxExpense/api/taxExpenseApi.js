import apiClient from '@/utils/apiClient';

const unwrap = (response) => response?.data?.data ?? response?.data;
const inFlightExpensePayeeReads = new Map();

export const listTaxExpenseCategories = async () =>
  unwrap(await apiClient.get('/tax-expenses/categories'));

export const createTaxExpenseCategory = async (payload) =>
  unwrap(await apiClient.post('/tax-expenses/categories', payload));

export const listExpensePayees = ({ q } = {}) => {
  const normalizedQuery = String(q || '').trim();
  const key = normalizedQuery.toLocaleLowerCase();
  const existing = inFlightExpensePayeeReads.get(key);
  if (existing) return existing;

  const pending = apiClient
    .get('/tax-expenses/expense-payees', {
      params: normalizedQuery ? { q: normalizedQuery } : undefined,
    })
    .then(unwrap)
    .finally(() => {
      if (inFlightExpensePayeeReads.get(key) === pending) {
        inFlightExpensePayeeReads.delete(key);
      }
    });

  inFlightExpensePayeeReads.set(key, pending);
  return pending;
};

// Compatibility authority for expense flows that still use the supplier-oriented name.
// Expense payees are served by the dedicated /tax-expenses/expense-payees endpoint.
export const listExpensePayeeSuppliers = async (params = {}) =>
  listExpensePayees(params);

export const createExpensePayee = async (payload) =>
  unwrap(await apiClient.post('/tax-expenses/expense-payees', payload));

export const listRepairExpenseReasons = async () =>
  unwrap(await apiClient.get('/tax-expenses/repair-reasons'));

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

export const getTaxExpenseAssessmentSuggestion = async (taxExpenseId) =>
  unwrap(await apiClient.get(`/tax-expenses/${taxExpenseId}/assessment-suggestion`));

export const confirmTaxExpenseAssessment = async (taxExpenseId, payload) =>
  unwrap(await apiClient.post(`/tax-expenses/${taxExpenseId}/assessment-confirmation`, payload));

export const verifyTaxExpenseEvidence = async (taxExpenseId, payload = {}) =>
  unwrap(await apiClient.post(`/tax-expenses/${taxExpenseId}/evidence/verify`, payload));
