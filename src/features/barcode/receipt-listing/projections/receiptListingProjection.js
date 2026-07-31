export const projectReceiptListingParams = (input = {}) => {
  const params = {};

  if (typeof input?.printed === 'boolean') {
    params.printed = input.printed;
  }

  if (input?.limit != null) {
    const parsedLimit = Number(input.limit);
    params.limit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 50, 1), 100);
  }

  return params;
};

export const projectReceiptListingResult = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.receipts)) return response.receipts;
  return [];
};
