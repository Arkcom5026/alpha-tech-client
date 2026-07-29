import { useCallback } from 'react';

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
        fullCustomer = normalizeCustomer(payload) || baseCustomer;
      } catch {
        fullCustomer = baseCustomer;
      }
    }

    setCustomerId(fullCustomer.id);
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
