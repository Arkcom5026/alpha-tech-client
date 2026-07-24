import { resolveSaleDocumentRoute } from '../saleDocumentRoute';

export const openCompletedSaleDocument = ({
  shopSlug, saleId, option, reservedWindow, navigate,
  lastDocumentKey, browser = globalThis.window,
}) => {
  const documentKey = `${String(saleId)}::${String(option)}`;
  if (!saleId || !option || option === 'NONE' || documentKey === lastDocumentKey) {
    return { opened: false, documentKey: lastDocumentKey };
  }
  const route = resolveSaleDocumentRoute({ shopSlug, saleId, option });
  if (!route) return { opened: false, documentKey: lastDocumentKey };
  if (reservedWindow && !reservedWindow.closed) {
    reservedWindow.location.replace(route);
    reservedWindow.focus?.();
    return { opened: true, documentKey, route, mode: 'reserved' };
  }
  const opened = browser?.open?.(route, '_blank', 'noopener,noreferrer');
  if (!opened) {
    navigate(route);
    return { opened: true, documentKey, route, mode: 'same-tab' };
  }
  return { opened: true, documentKey, route, mode: 'new-window' };
};
