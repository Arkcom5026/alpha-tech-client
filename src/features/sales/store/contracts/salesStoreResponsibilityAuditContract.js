export const SALES_STORE_RESPONSIBILITY_AUDIT_CONTRACT = Object.freeze({
  runtimeEntrypoint: 'src/features/sales/store/salesStore.js',
  retainedResponsibilities: Object.freeze({
    CREATE_SESSION: Object.freeze([
      'saleItems',
      'customerId',
      'paymentList',
      'cardRef',
      'billDiscount',
      'sharedBillDiscountPerItem',
      'saleCompleted',
      'completionState',
      'completionCommandId',
      'setPaymentAmount',
      'setBillDiscount',
      'addSaleItemAction',
      'removeSaleItemAction',
      'clearSaleItemsAction',
      'updateItemDiscountAction',
      'updateSaleItemAction',
      'confirmSaleOrderAction',
      'resetSaleOrderAction',
    ]),
    RETURN: Object.freeze([
      'returnSaleAction',
    ]),
    ONLINE_ORDER_CONVERSION: Object.freeze([
      'convertOrderOnlineToSaleAction',
    ]),
    COMPATIBILITY: Object.freeze([
      'normalizeStockItemId',
      'devError',
      'setPaymentAmountAction',
      'setBillDiscountAction',
      'setSharedBillDiscountPerItemAction',
      'setCardRefAction',
      'setLastCreatedSaleIdAction',
      'clearSaleCompletionIdentity',
    ]),
  }),
  retiredResponsibilities: Object.freeze({
    DASHBOARD_OVERVIEW: Object.freeze({
      owner: 'src/features/sales/history/store/saleDashboardRuntimeCapability.js',
      symbols: Object.freeze([
        'salesOverviewLoading',
        'salesOverviewError',
        'salesOverviewLastLoadedAt',
        'clearSalesOverviewErrorAction',
        'fetchSalesDashboardOverviewAction',
      ]),
    }),
    HISTORY_QUERY: Object.freeze({
      owner: 'src/features/sales/history/store/saleHistoryQueryRuntimeCapability.js',
      symbols: Object.freeze([
        'sales',
        'currentSale',
        'loadSalesAction',
        'setCurrentSale',
        'setCurrentSaleAction',
        'getSaleByIdAction',
      ]),
    }),
    PRINTABLE_QUERY: Object.freeze({
      owner: 'src/features/sales/history/store/salePrintableRuntimeCapability.js',
      symbols: Object.freeze([
        'printableSales',
        'loadPrintableSalesAction',
        'normalizePrintableRows',
        'normalizeSaleDetail',
      ]),
    }),
    SETTLEMENT: Object.freeze({
      owner: 'src/features/sales/history/store/saleSettlementRuntimeCapability.js',
      symbols: Object.freeze([
        'markSalePaidAction',
      ]),
    }),
    DOCUMENT_LINES: Object.freeze({
      owner: 'src/features/sales/documents/store/saleDocumentRuntimeSlice.js',
      symbols: Object.freeze([
        'updateSaleDocumentLinesAction',
      ]),
    }),
  }),
  safetyRules: Object.freeze({
    destructiveMigrationAllowed: false,
    retirementRequiresCertifiedOwner: true,
    retirementRequiresConsumerAudit: true,
    retainedRuntimeSurfaceMustRemainAvailable: true,
    duplicateRuntimeAuthorityAllowed: false,
  }),
});
