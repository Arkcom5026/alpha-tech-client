const RECENT_PRINTABLE_TTL_MS = 5000;
const MAX_RECENT_PRINTABLE_REQUESTS = 32;

const inFlightPrintableRequests = new Map();
const recentPrintableResults = new Map();

const normalizePrintableParams = (params = {}) => {
  const normalized = {};
  for (const key of Object.keys(params).sort()) {
    if (key === 'forceRefresh' || key === '_ts') continue;
    const value = params[key];
    if (value === undefined || value === null || value === '') {
      if (value === '') normalized[key] = '';
      continue;
    }
    normalized[key] = value;
  }
  return normalized;
};

const createPrintableRequestKey = (params) => JSON.stringify(normalizePrintableParams(params));

const pruneRecentPrintableResults = (now) => {
  for (const [key, entry] of recentPrintableResults.entries()) {
    if (now - entry.completedAt > RECENT_PRINTABLE_TTL_MS) {
      recentPrintableResults.delete(key);
    }
  }

  while (recentPrintableResults.size > MAX_RECENT_PRINTABLE_REQUESTS) {
    const oldestKey = recentPrintableResults.keys().next().value;
    if (oldestKey === undefined) break;
    recentPrintableResults.delete(oldestKey);
  }
};

export const clearPrintableSalesRequestCache = () => {
  recentPrintableResults.clear();
};

export const runPrintableSalesRequest = (params = {}, request) => {
  const queryParams = normalizePrintableParams(params);
  const requestKey = createPrintableRequestKey(queryParams);
  const forceRefresh = params?.forceRefresh === true;
  const now = Date.now();

  pruneRecentPrintableResults(now);

  if (!forceRefresh) {
    const recent = recentPrintableResults.get(requestKey);
    if (recent && now - recent.completedAt <= RECENT_PRINTABLE_TTL_MS) {
      return Promise.resolve(recent.data);
    }

    const inFlight = inFlightPrintableRequests.get(requestKey);
    if (inFlight) return inFlight;
  }

  const pending = Promise.resolve()
    .then(() => request(queryParams))
    .then((data) => {
      recentPrintableResults.delete(requestKey);
      recentPrintableResults.set(requestKey, {
        data,
        completedAt: Date.now(),
      });
      pruneRecentPrintableResults(Date.now());
      return data;
    })
    .finally(() => {
      if (inFlightPrintableRequests.get(requestKey) === pending) {
        inFlightPrintableRequests.delete(requestKey);
      }
    });

  inFlightPrintableRequests.set(requestKey, pending);
  return pending;
};

export const PRINTABLE_RECENT_RESULT_TTL_MS = RECENT_PRINTABLE_TTL_MS;
