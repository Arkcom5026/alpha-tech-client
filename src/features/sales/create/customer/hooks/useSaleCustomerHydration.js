import { useCallback } from 'react';
import {
  clearSaleCustomerFirstAssociation,
  storeSaleCustomerFirstAssociation,
} from '../services/saleCustomerFirstAssociationSession';

const normalizeCustomer = (payload) => payload?.customer || payload;

export const useSaleCustomerHydration = ({
  searchByCustomerId,
  setCustomerId,
  setDepositAmount,
  setSelectedDeposit,
  hydrateEditor,
  onSaleModeSelect,
  productSearchRef,
}) => {
  const hydrateSelection = useCallback(async (candidate) => {
    const baseCustomer = normalizeCustomer(candidate);
    if (!baseCustomer?.id) return null;

    let fullCustomer = baseCustomer;
    if (searchByCustomerId) {
      try {
        const payload = await searchByCustomerId(baseCustomer.id);
        fullCustomer = {
          ...(normalizeCustomer(payload) || baseCustomer),
          firstAssociationToken:
            baseCustomer.firstAssociationToken ||
            normalizeCustomer(payload)?.firstAssociationToken ||
            null,
        };
      } catch {
        fullCustomer = baseCustomer;
      }
    }

    setCustomerId(fullCustomer.id);
    if (fullCustomer.firstAssociationToken) {
      storeSaleCustomerFirstAssociation({
        customerId: fullCustomer.id,
        token: fullCustomer.firstAssociationToken,
      });
    } else {
      clearSaleCustomerFirstAssociation();
    }
    hydrateEditor(fullCustomer);

    const depositAmount = Number(fullCustomer?.depositAmount || fullCustomer?.customerDepositAmount || 0);
    setDepositAmount(Number.isFinite(depositAmount) ? depositAmount : 0);
    setSelectedDeposit(fullCustomer?.selectedDeposit || fullCustomer?.deposit || null);

    onSaleModeSelect?.('CASH');
    setTimeout(() => productSearchRef?.current?.focus(), 100);
    return fullCustomer;
  }, [hydrateEditor, onSaleModeSelect, productSearchRef, searchByCustomerId, setCustomerId, setDepositAmount, setSelectedDeposit]);

  return { hydrateSelection };
};
