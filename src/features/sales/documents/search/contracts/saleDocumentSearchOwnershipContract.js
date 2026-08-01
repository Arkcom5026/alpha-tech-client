export const SALE_DOCUMENT_SEARCH_OWNERSHIP_CONTRACT = Object.freeze({
  runtimeConsumers: Object.freeze([
    'src/features/bill/pages/PrintBillListPage.jsx',
    'src/features/deliveryNote/pages/DeliveryNoteListPage.jsx',
  ]),
  retiredRootStorePath: 'src/features/sales/store/salesStore.js',
  printableCapabilityOwner:
    'src/features/sales/history/store/salePrintableRuntimeCapability.js',
  sharedOwnerRoot: 'src/features/sales/documents/search',
  sharedResponsibilities: Object.freeze([
    'query-projection',
    'query-validation',
    'printable-sale-api-execution',
    'rows-loading-error-state',
    'last-query-and-search-timestamp',
    'response-normalization',
  ]),
  policies: Object.freeze({
    BILL: Object.freeze({
      queryFlag: 'onlyPaid',
      eligibility: 'paid-or-received-sale',
      workspace: 'bill',
      rendererOwnership: 'separate',
    }),
    DELIVERY_NOTE: Object.freeze({
      queryFlag: 'onlyUnpaid',
      eligibility: 'unpaid-or-credit-oriented-sale',
      workspace: 'delivery-note',
      rendererOwnership: 'separate',
    }),
  }),
  authorityRules: Object.freeze({
    selectionAuthority: 'saleId',
    serverRevalidationRequiredAfterSelection: true,
    navigationSnapshotMayBeOptimisticOnly: true,
    duplicateRootPrintableAuthorityAllowed: false,
  }),
  safety: Object.freeze({
    mergeRenderers: false,
    mergeDocumentWorkspaces: false,
    moveDocumentLineEditingIntoSearch: false,
    rootPrintableAuthorityRetired: true,
    runtimeEvidenceRequiredForAuthorityChange: true,
  }),
});
