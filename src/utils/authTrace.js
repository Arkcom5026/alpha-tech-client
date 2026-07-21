// src/utils/authTrace.js
// ⚠️ TEMPORARY RUNTIME TRACING — Remove after investigation
// No business logic changes. Only adds console.log tracing.

const TRACE_PREFIX = '[AUTH-TRACE]';
const ENABLED = true;

const sha256 = async (str) => {
  try {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8).toUpperCase();
  } catch { return str ? str.slice(0, 8).toUpperCase() : 'NULL'; }
};

const fingerprintCache = new Map();
const getFingerprint = (token) => {
  if (!token) return 'NULL';
  if (fingerprintCache.has(token)) return fingerprintCache.get(token);
  // Synchronous first 8 chars of hex of first bytes
  try {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const chr = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    const fp = Math.abs(hash).toString(16).slice(0, 8).toUpperCase().padStart(8, '0');
    fingerprintCache.set(token, fp);
    return fp;
  } catch { return token.slice(0, 8).toUpperCase(); }
};

const now = () => new Date().toISOString().slice(11, 23);

const trace = (category, ...args) => {
  if (!ENABLED) return;
  console.log(`${TRACE_PREFIX} [${now()}] [${category}]`, ...args);
};

// Store a reference to the latest auth state for tracing
let lastAuthState = null;

export const initAuthTrace = () => {
  trace('INIT', 'Auth trace initialized');
};

export const traceRequest = (config) => {
  const state = typeof window !== 'undefined' ? 
    (window.__authStoreState ? JSON.parse(window.__authStoreState) : {}) : {};
  trace('REQUEST', 
    `id=${config._traceId || '?'}`,
    `${(config.method || 'GET').toUpperCase()}`,
    `${config.url || '?'}`,
    `Bearer=${config.headers?.Authorization ? 'YES' : 'NO'}`,
    `token=${getFingerprint(state.accessToken || state.token)}`,
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
  trace('RESPONSE',
    `id=${req._traceId || '?'}`,
    `${error.response?.status || 'NETWORK_ERROR'}`,
    `${req.url || '?'}`,
    `body=${JSON.stringify(error.response?.data || {})}`
  );
};

export const traceRefreshStart = (reason, originalUrl) => {
  const state = typeof window !== 'undefined' ? 
    (window.__authStoreState ? JSON.parse(window.__authStoreState) : {}) : {};
  trace('REFRESH', 'START',
    `reason=${reason}`,
    `original=${originalUrl || '?'}`,
    `token=${getFingerprint(state.accessToken || state.token)}`,
    `cookie=refreshToken (HttpOnly)`
  );
};

export const traceRefreshSuccess = (newToken) => {
  trace('REFRESH', 'SUCCESS',
    `newToken=${getFingerprint(newToken)}`
  );
};

export const traceRefreshFailed = (error) => {
  trace('REFRESH', 'FAILED',
    `reason=${error?.friendlyMessage || error?.message || '?'}`,
    `status=${error?.response?.status || '?'}`,
    `body=${JSON.stringify(error?.response?.data || {})}`
  );
};

export const traceStoreMutation = (prevState, nextState, trigger) => {
  const prevToken = getFingerprint(prevState?.accessToken || prevState?.token);
  const nextToken = getFingerprint(nextState?.accessToken || nextState?.token);
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

export const traceRouteGuard = (state) => {
  const token = state?.accessToken || state?.token;
  const isAuthenticated = !!(token) && !!state?.authChecked && !state?.isBootstrappingAuth;
  
  trace('ROUTE_GUARD',
    `token=${getFingerprint(token)}`,
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
