import { useCallback, useRef, useState } from 'react';

import { openCompletedSaleDocument } from '../../../documents/services/saleDocumentWorkflow';

export const useSaleDocumentHandoff = ({
  shopSlug,
  navigate,
  clearCart,
  clearHeldCart,
  setHideCustomerDetails,
  productSearchRef,
}) => {
  const [saleOption, setSaleOption] = useState('NONE');
  const lastDocumentKeyRef = useRef('');

  const handleConfirmed = useCallback((saleId, option, printContext = {}) => {
    const finalOption = option || saleOption;

    if (saleId && finalOption && finalOption !== 'NONE') {
      const printKey = `${String(saleId)}::${String(finalOption)}`;
      if (lastDocumentKeyRef.current !== printKey) {
        const opened = openCompletedSaleDocument({
          shopSlug,
          saleId,
          option: finalOption,
          reservedWindow: printContext?.printWindow,
          navigate,
          lastDocumentKey: lastDocumentKeyRef.current,
        });
        if (opened.opened) lastDocumentKeyRef.current = opened.documentKey;
      }
    }

    clearCart();
    clearHeldCart();
    setTimeout(() => {
      setHideCustomerDetails(true);
      productSearchRef?.current?.focus?.();
    }, 200);
  }, [
    saleOption,
    shopSlug,
    navigate,
    clearCart,
    clearHeldCart,
    setHideCustomerDetails,
    productSearchRef,
  ]);

  return {
    saleOption,
    setSaleOption,
    handleConfirmed,
  };
};
