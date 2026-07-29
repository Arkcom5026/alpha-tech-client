export const SALE_DOCUMENT_WORKSPACE_AUTHORITY_CONTRACT = Object.freeze({
  identityAuthority: 'ROUTE_SALE_ID',
  dataAuthority: 'SERVER_REVALIDATED_SALE',
  optimisticSnapshotAuthority: false,
  requiredEntrySources: Object.freeze(['SALE_COMPLETION', 'HISTORY_SEARCH']),
  workspaceOwners: Object.freeze({
    identity: 'saleDocumentWorkspaceIdentity',
    hydration: 'saleDocumentWorkspaceStore',
    lineMutation: 'saleDocumentLineUpdateController',
  }),
  requiredWorkspaceRules: Object.freeze([
    'SERVER_REVALIDATION_BEFORE_PRINT',
    'RELOAD_AFTER_DOCUMENT_LINE_MUTATION',
    'SEARCH_STORE_DOES_NOT_OWN_OPEN_DOCUMENT',
    'RENDERER_REMAINS_DOCUMENT_SPECIFIC',
  ]),
  currentConsumers: Object.freeze({
    billShort: 'src/features/bill/pages/PrintBillPageShortTax.jsx',
    billFull: 'src/features/bill/pages/PrintBillPageFullTax.jsx',
    deliveryNote: 'src/features/deliveryNote/pages/PrintDeliveryNotePage.jsx',
  }),
  forbiddenFinalAuthorities: Object.freeze([
    'location.state.sale',
    'search result row',
    'sale completion response snapshot',
  ]),
  compatibility: Object.freeze({
    billStorePreserved: true,
    legacySalesStoreActionPreserved: true,
    runtimeEvidenceRequiredForRemoval: true,
  }),
});
