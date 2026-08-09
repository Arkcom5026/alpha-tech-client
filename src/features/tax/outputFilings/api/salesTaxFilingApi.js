import apiClient from '@/utils/apiClient';
const unwrap = (response) => response?.data?.data ?? response?.data;
export const listSalesTaxFilings = async ({ branchId, year, month }) => unwrap(await apiClient.get('/tax/output-filings', { params: { branchId, year, month } }));
export const prepareSalesTaxFiling = async ({ branchId, year, month }) => unwrap(await apiClient.post('/tax/output-filings/prepare', { branchId, year, month }));
export const submitSalesTaxFiling = async ({ branchId, batchId }) => unwrap(await apiClient.post(`/tax/output-filings/${batchId}/submit`, { branchId }));
