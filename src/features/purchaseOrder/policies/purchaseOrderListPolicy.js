export const PURCHASE_ORDER_ACTIVE_STATUSES = 'PENDING,PARTIALLY_RECEIVED';

export const buildPurchaseOrderListQuery = ({ searchQuery, showAllHistory }) => ({
  search: searchQuery,
  status: showAllHistory ? 'all' : PURCHASE_ORDER_ACTIVE_STATUSES,
});
