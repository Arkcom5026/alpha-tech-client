export const mutableTaxDocumentStatuses = Object.freeze([
  'DRAFT',
  'REGISTERED',
  'UNDER_REVIEW',
  'REJECTED',
]);

const mutableTaxDocumentStatusSet = new Set(mutableTaxDocumentStatuses);

export const isTaxDocumentMutable = (status) => (
  mutableTaxDocumentStatusSet.has(String(status || '').toUpperCase())
);
