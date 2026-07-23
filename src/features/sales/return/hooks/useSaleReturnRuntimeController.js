import { useCallback, useEffect, useMemo } from 'react';
import { getSaleReturnEligibility } from '../api/saleReturnApi';
import {
  buildAvailableReturnItems,
  buildSaleReturnProjection,
} from '../builders/saleReturnCommandBuilder';
import {
  mapSaleReturnFailure,
  validateSaleReturnDraft,
} from '../policies/saleReturnUiPolicy';
import useSaleReturnRuntimeStore from '../store/saleReturnRuntimeStore';
import { runCompleteSaleReturn } from '../workflows/completeSaleReturnWorkflow';
import { clearSaleReturnIdentity } from '../workflows/saleReturnIdentity';

const useSaleReturnRuntimeController = (saleId) => {
  const runtime = useSaleReturnRuntimeStore();
  const availableItems = useMemo(
    () => buildAvailableReturnItems(runtime.eligibility),
    [runtime.eligibility],
  );
  const projection = useMemo(() => buildSaleReturnProjection({
    availableItems,
    lineState: runtime.lineState,
    globalReason: runtime.reason,
    refunds: runtime.refunds,
  }), [availableItems, runtime.lineState, runtime.reason, runtime.refunds]);

  const reload = useCallback(async () => {
    runtime.startLoading();
    try {
      runtime.loadSucceeded(await getSaleReturnEligibility(saleId));
    } catch (error) {
      runtime.fail(mapSaleReturnFailure(error));
    }
  }, [runtime, saleId]);

  useEffect(() => {
    reload();
    return () => runtime.reset();
  // The sale identity is the lifecycle boundary; Zustand actions are stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleId]);

  const submit = async () => {
    const validationError = validateSaleReturnDraft({
      availableItems,
      lineState: runtime.lineState,
      projection,
      reason: runtime.reason,
      refunds: runtime.refunds,
      paymentItems: runtime.eligibility?.paymentItems,
    });
    if (validationError) {
      runtime.fail(validationError);
      return null;
    }
    runtime.startSubmitting();
    try {
      const result = await runCompleteSaleReturn({
        saleId,
        reason: runtime.reason,
        projection,
        refunds: runtime.refunds,
      });
      runtime.complete(result);
      return result;
    } catch (error) {
      runtime.fail(mapSaleReturnFailure(error));
      return null;
    }
  };

  const reset = () => {
    clearSaleReturnIdentity(saleId);
    runtime.reset();
  };

  return {
    ...runtime,
    availableItems,
    projection,
    reload,
    submit,
    reset,
  };
};

export default useSaleReturnRuntimeController;
