import { resolveSaleDocumentRoute } from '../saleDocumentRoute';

export const openCompletedSaleDocument = ({
  shopSlug, saleId, option, reservedWindow, navigate,
  lastDocumentKey,
}) => {
  const documentKey = `${String(saleId)}::${String(option)}`;
  if (!saleId || !option || option === 'NONE' || documentKey === lastDocumentKey) {
    return { opened: false, documentKey: lastDocumentKey };
  }
  const route = resolveSaleDocumentRoute({ shopSlug, saleId, option });
  if (!route) return { opened: false, documentKey: lastDocumentKey };
  if (typeof navigate !== 'function') {
    return { opened: false, documentKey: lastDocumentKey, route, reason: 'missing-navigation' };
  }
  if (reservedWindow && !reservedWindow.closed) {
    reservedWindow.close?.();
  }
  navigate(route);
  return { opened: true, documentKey, route, mode: 'same-tab' };
};
