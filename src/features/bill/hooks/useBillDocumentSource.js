import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBillStore } from '@/features/bill/store/billStore';
import { getConsolidatedDeliveryPrintable } from '@/features/combinedBilling/api/combinedBillingApi';
import {
  buildConsolidatedBillProjection,
  isConsolidatedDocumentSource,
} from '@/features/combinedBilling/adapters/consolidatedDocumentAdapter';

const resolveErrorMessage = (error) => (
  error?.response?.data?.message
  || error?.response?.data?.error
  || error?.message
  || 'ไม่สามารถโหลดข้อมูลเอกสารได้'
);

export const useBillDocumentSource = ({ saleId, sourceType, sourceId, paymentId } = {}) => {
  const isConsolidated = isConsolidatedDocumentSource(sourceType);
  const consolidatedId = sourceId || (isConsolidated ? saleId : null);
  const billStore = useBillStore();
  const [combinedState, setCombinedState] = useState({
    sale: null,
    payment: null,
    saleItems: [],
    config: null,
    loading: false,
    error: null,
  });

  const reset = useCallback(() => {
    if (isConsolidated) {
      setCombinedState({
        sale: null,
        payment: null,
        saleItems: [],
        config: null,
        loading: false,
        error: null,
      });
      return;
    }
    billStore.resetAction();
  }, [billStore.resetAction, isConsolidated]);

  const reload = useCallback(async () => {
    if (isConsolidated) {
      if (!consolidatedId) {
        const message = 'ไม่พบแหล่งเอกสารรวมสำหรับการพิมพ์บิล';
        setCombinedState((state) => ({ ...state, loading: false, error: message }));
        throw new Error(message);
      }

      setCombinedState((state) => ({ ...state, loading: true, error: null }));
      try {
        const data = await getConsolidatedDeliveryPrintable(consolidatedId);
        const projection = buildConsolidatedBillProjection(data);
        if (!projection) throw new Error('ไม่พบข้อมูลเอกสารรวมสำหรับการพิมพ์บิล');
        setCombinedState({ ...projection, loading: false, error: null });
        return projection;
      } catch (error) {
        setCombinedState((state) => ({
          ...state,
          loading: false,
          error: resolveErrorMessage(error),
        }));
        throw error;
      }
    }

    if (!saleId) return null;
    billStore.resetAction();
    return billStore.loadSaleByIdAction(
      saleId,
      paymentId
        ? { paymentId, params: { paymentId } }
        : undefined
    );
  }, [billStore.loadSaleByIdAction, billStore.resetAction, consolidatedId, isConsolidated, paymentId, saleId]);

  useEffect(() => () => {
    if (!isConsolidated) billStore.resetAction();
  }, [billStore.resetAction, isConsolidated]);

  return useMemo(() => {
    const state = isConsolidated ? combinedState : billStore;
    return {
      sale: state.sale,
      payment: state.payment,
      saleItems: state.saleItems,
      config: state.config,
      loading: state.loading,
      error: state.error,
      reload,
      reset,
      isConsolidated,
      canEditDocumentLines: !isConsolidated,
      documentSourceId: isConsolidated ? Number(consolidatedId) : Number(saleId),
    };
  }, [billStore, combinedState, consolidatedId, isConsolidated, reload, reset, saleId]);
};

export default useBillDocumentSource;
