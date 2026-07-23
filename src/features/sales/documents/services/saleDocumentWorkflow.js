import { resolveSaleDocumentRoute } from '../saleDocumentRoute';

export const openCompletedSaleDocument = ({
  shopSlug, saleId, option, navigate, lastDocumentKey,
}) => {
  const documentKey = `${String(saleId)}::${String(option)}`;
  if (!saleId || !option || option === 'NONE' || documentKey === lastDocumentKey) {
    return { opened: false, documentKey: lastDocumentKey };
  }
  const route = resolveSaleDocumentRoute({ shopSlug, saleId, option });
  if (!route) return { opened: false, documentKey: lastDocumentKey };

  navigate(route);
  return { opened: true, documentKey, route, mode: 'same-tab' };
};
