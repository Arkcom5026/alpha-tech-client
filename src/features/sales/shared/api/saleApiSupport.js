export const attachSaleApiContext = (error, context) => {
  try {
    if (error && typeof error === 'object') {
      if (!error._apiContext) error._apiContext = context;
      if (!error._apiAt) error._apiAt = new Date().toISOString();
    }
  } catch {
    // Diagnostics must never replace the original API failure.
  }
  return error;
};
