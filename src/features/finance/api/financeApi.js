




// 📁 FILE: src/features/finance/api/financeApi.js
// ✅ Finance API layer (must use apiClient.js)
// - Keep functions small and predictable
// - Do NOT send branchId from FE (server must read req.user.branchId)

import apiClient from '@/utils/apiClient';

// ------------------------------------------------------------
// helpers
// ------------------------------------------------------------

// ✅ Make endpoint prefix resilient:
// - If apiClient.defaults.baseURL already contains '/api' -> do NOT double prefix
// - Otherwise -> prefix with '/api' (works with Vite proxy + Express '/api/*' routes)
const getApiPrefix = () => {
  try {
    const base = String(apiClient?.defaults?.baseURL ?? '');
    return base.includes('/api') ? '' : '/api';
  } catch (_) {
    return '/api';
  }
};

const cleanParams = (params = {}) => {
  const p = params && typeof params === 'object' ? params : {};
  const out = {};

  for (const [k, v] of Object.entries(p)) {
    if (v == null) continue;
    if (typeof v === 'string' && !v.trim()) continue;
    out[k] = typeof v === 'string' ? v.trim() : v;
  }

  // ✅ Guardrail: never allow client to pass branchId
  if ('branchId' in out) delete out.branchId;

  // ✅ cache-bust (safe)
  out._ts = Date.now();
  return out;
};

// ✅ DEV-only logger (no console.* in prod path)
const devError = (...args) => {
  try {
    if (import.meta?.env?.DEV) console.error(...args);
  } catch (_) {
    // ignore
  }
};

const get = async (url, params = {}) => {
  try {
    const prefix = getApiPrefix();
    const fullUrl = url?.startsWith('/') ? `${prefix}${url}` : `${prefix}/${url}`;
    const res = await apiClient.get(fullUrl, { params: cleanParams(params) });
    return res?.data;
  } catch (err) {
    devError('[financeApi] GET failed:', url, err);
    throw err;
  }
};

// ------------------------------------------------------------
// Accounts Receivable (AR)
// ------------------------------------------------------------
// Suggested BE endpoints:
//   GET /api/finance/ar/summary
//   GET /api/finance/ar

export const getAccountsReceivableSummary = async (params = {}) => {
  return get('/finance/ar/summary', params);
};

export const getAccountsReceivableRows = async (params = {}) => {
  return get('/finance/ar', params);
};

// ------------------------------------------------------------
// Customer Credit
// ------------------------------------------------------------
// Suggested BE endpoints:
//   GET /api/finance/customer-credit/summary
//   GET /api/finance/customer-credit

export const getCustomerCreditSummary = async (params = {}) => {
  return get('/finance/customer-credit/summary', params);
};

export const getCustomerCreditRows = async (params = {}) => {
  return get('/finance/customer-credit', params);
};






