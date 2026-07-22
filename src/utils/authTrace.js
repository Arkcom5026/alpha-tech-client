// src/utils/authTrace.js
// ⚠️ TEMPORARY RUNTIME TRACING — Remove after investigation
// No business logic changes. Only adds console.log tracing.

const TRACE_PREFIX = '[AUTH-TRACE]';
const ENABLED = true;

const fingerprintCache = new Map();

// Secure SHA-256 fingerprint for token correlation.
// Uses SubtleCrypto (async) with a synchronous fallback that only emits a boolean.
const getFingerprint = async (token) => {
  if (!token) return 'NULL';
  if (fingerprintCache.has(token)) return fingerprintCache.get(token);
  try {
    const buf = new TextEncoder().encode(token);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const fp = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 12).toUpperCase();
    fingerprintCache.set(token, fp);
    return fp;
  } catch {
    // Synchronous fallback: emit only tokenPresent boolean, never a token substring
    return 'PRESENT';
  }
};

const now = () => new Date().toISOString().slice(11, 23);

const trace = (category, ...args) => {
  if (!ENABLED) return;
  console.log(`${TRACE_PREFIX} [${now()}] [${category}]`, ...args);
};

export const initAuthTrace = () => {
  trace('INIT', 'Auth trace initialized');
};

export const traceRequest = async (config) => {
  const state = typeof window !== 'undefined' ? 
    (window.__authStoreState ? JSON.parse(window.__authStoreState) : {}) : {};
  trace('REQUEST', 
    `id=${config._traceId || '?'}`,
    `${(config.method || 'GET').toUpperCase()}`,
    `${config.url || '?'}`,
    `Bearer=${config.headers?.Authorization ? 'YES' : 'NO'}`,
    `token=${await getFingerprint(state.accessToken || state.token)}`,
    `authChecked=${state.authChecked}`,
    `bootstrapping=${state.isBootstrappingAuth}`
  );
};

export const traceResponse = (response) => {
  trace('RESPONSE',
    `id=${response.config?._traceId || '?'}`,
    `${response.status}`,
    `${response.config?.url || '?'}`
  );
};

export const traceError = (error) => {
  const req = error.config || {};
  const status = error.response?.status || 'NETWORK_ERROR';
  const hasData = error.response?.data ? 'YES' : 'NO';
  trace('RESPONSE',
    `id=${req._traceId || '?'}`,
    `${status}`,
    `${req.url || '?'}`,
    `hasBody=${hasData}`
  );
};

export const traceRefreshStart = async (reason, originalUrl) => {
  const state = typeof window !== 'undefined' ? 
    (window.__authStoreState ? JSON.parse(window.__authStoreState) : {}) : {};
  trace('REFRESH', 'START',
    `reason=${reason}`,
    `original=${originalUrl || '?'}`,
    `token=${await getFingerprint(state.accessToken || state.token)}`,
    `cookie=refreshToken (HttpOnly)`
  );
};

export const traceRefreshSuccess = async (newToken) => {
  trace('REFRESH', 'SUCCESS',
    `newToken=${await getFingerprint(newToken)}`
  );
};

export const traceRefreshFailed = (error) => {
  const status = error?.response?.status || '?';
  const hasData = error?.response?.data ? 'YES' : 'NO';
  trace('REFRESH', 'FAILED',
    `reason=${error?.friendlyMessage || error?.message || '?'}`,
    `status=${status}`,
    `hasBody=${hasData}`
  );
};

export const traceStoreMutation = async (prevState, nextState, trigger) => {
  const prevToken = await getFingerprint(prevState?.accessToken || prevState?.token);
  const nextToken = await getFingerprint(nextState?.accessToken || nextState?.token);
  const prevAuthChecked = prevState?.authChecked;
  const nextAuthChecked = nextState?.authChecked;
  const prevBootstrapping = prevState?.isBootstrappingAuth;
  const nextBootstrapping = nextState?.isBootstrappingAuth;

  const changes = [];
  if (prevToken !== nextToken) changes.push(`accessToken ${prevToken} → ${nextToken}`);
  if (prevAuthChecked !== nextAuthChecked) changes.push(`authChecked ${prevAuthChecked} → ${nextAuthChecked}`);
  if (prevBootstrapping !== nextBootstrapping) changes.push(`isBootstrappingAuth ${prevBootstrapping} → ${nextBootstrapping}`);

  if (changes.length > 0) {
    trace('STORE', ...changes, `trigger=${trigger}`);
    // If token went to NULL, log stack trace
    if (nextToken === 'NULL' && prevToken !== 'NULL') {
      try { throw new Error('STACK'); } catch (e) {
        const stackLines = (e.stack || '').split('\n').slice(2, 6).map(l => l.trim());
        trace('STORE', 'TOKEN_CLEARED', 'stack=', ...stackLines);
      }
    }
  }

  // Update the window reference for request tracing
  if (typeof window !== 'undefined') {
    window.__authStoreState = JSON.stringify(nextState);
  }
};

export const traceRouteGuard = async (state) => {
  const token = state?.accessToken || state?.token;
  const isAuthenticated = !!(token) && !!state?.authChecked && !state?.isBootstrappingAuth;
  
  trace('ROUTE_GUARD',
    `token=${await getFingerprint(token)}`,
    `authChecked=${state?.authChecked}`,
    `bootstrapping=${state?.isBootstrappingAuth}`,
    `isAuthenticated=${isAuthenticated}`
  );

  if (!isAuthenticated && state?.authChecked && !state?.isBootstrappingAuth) {
    trace('ROUTE_GUARD', 'REDIRECT=/login',
      `reason=${!token ? 'no token' : !state?.authChecked ? 'not checked' : 'bootstrapping'}`
    );
    try { throw new Error('STACK'); } catch (e) {
      const stackLines = (e.stack || '').split('\n').slice(2, 6).map(l => l.trim());
      trace('ROUTE_GUARD', 'redirect_stack=', ...stackLines);
    }
  }
};

export const traceLogout = (reason, caller) => {
  trace('LOGOUT', `reason=${reason}`, `caller=${caller}`);
  try { throw new Error('STACK'); } catch (e) {
    const stackLines = (e.stack || '').split('\n').slice(2, 8).map(l => l.trim());
    trace('LOGOUT', 'stack=', ...stackLines);
  }
};

export const traceFlowMarker = (marker, data = {}) => {
  trace('FLOW', marker, ...Object.entries(data).map(([k, v]) => `${k}=${v}`));
};

export default {
  initAuthTrace,
  traceRequest,
  traceResponse,
  traceError,
  traceRefreshStart,
  traceRefreshSuccess,
  traceRefreshFailed,
  traceStoreMutation,
  traceRouteGuard,
  traceLogout,
  traceFlowMarker,
};
