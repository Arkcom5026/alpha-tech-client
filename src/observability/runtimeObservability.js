import apiClient from '@/utils/apiClient';

const MAX_MESSAGE_LENGTH = 1000;
let installed = false;

const safeMessage = (value) => String(value || '')
  .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer ***')
  .slice(0, MAX_MESSAGE_LENGTH);

export const extractRequestId = (value) => {
  const response = value?.response || value;
  return (
    response?.headers?.['x-request-id'] ||
    response?.headers?.['X-Request-Id'] ||
    response?.data?.requestId ||
    value?.requestId ||
    value?.original?.response?.headers?.['x-request-id'] ||
    value?.original?.response?.data?.requestId ||
    null
  );
};

export const recordClientIncident = (incidentCode, details = {}) => {
  const event = {
    level: 'error',
    event: 'client_runtime_incident',
    incidentCode,
    occurredAt: new Date().toISOString(),
    ...details,
  };

  console.error(JSON.stringify(event));

  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('alphatech:runtime-incident', { detail: event }));
  }

  return event;
};

const correlateResponse = (response) => {
  const requestId = extractRequestId(response);
  if (requestId) response.requestId = requestId;
  return response;
};

const correlateError = (error) => {
  const requestId = extractRequestId(error);
  if (requestId) error.requestId = requestId;

  if (error?.response?.status >= 500 || !error?.response) {
    recordClientIncident(error?.response ? 'API_SERVER_FAILURE' : 'API_NETWORK_FAILURE', {
      requestId,
      status: error?.response?.status || null,
      method: error?.config?.method || error?.original?.config?.method || null,
      path: error?.config?.url || error?.original?.config?.url || null,
      message: safeMessage(error?.message),
    });
  }

  return Promise.reject(error);
};

export const installRuntimeObservability = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  apiClient.interceptors.response.use(correlateResponse, correlateError);

  window.addEventListener('error', (event) => {
    recordClientIncident('BROWSER_UNCAUGHT_ERROR', {
      message: safeMessage(event?.error?.message || event?.message),
      source: event?.filename || null,
      line: event?.lineno || null,
      column: event?.colno || null,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    recordClientIncident('BROWSER_UNHANDLED_REJECTION', {
      requestId: extractRequestId(reason),
      message: safeMessage(reason?.message || reason),
    });
  });
};
