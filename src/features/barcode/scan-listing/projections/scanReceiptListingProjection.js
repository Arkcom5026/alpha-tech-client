export const projectScanReceiptListingResult = (response) => {
  const receipts = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.receipts)
        ? response.receipts
        : [];

  return {
    receipts,
    sourceResponse: response,
  };
};
