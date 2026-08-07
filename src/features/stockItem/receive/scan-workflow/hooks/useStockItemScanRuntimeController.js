import { useCallback } from 'react';
import useStockItemScanFocusController from './useStockItemScanFocusController';
import useStockItemWorkingGroupController from './useStockItemWorkingGroupController';
import { deriveEffectiveReceiveInput } from '../policies/stockItemScanWorkflowPolicy';

export const useStockItemScanRuntimeController = ({
  rows = [],
  query = '',
  isPending,
  resolveProductIdentity,
  resolveSearchText,
  barcodeInputRef,
  serialInputRef,
  searchInputRef,
  editSerialInputRef,
  manualSerialMode = false,
  submitting = false,
  editingSerial = false,
} = {}) => {
  const workingGroupController = useStockItemWorkingGroupController({
    rows,
    query,
    isPending,
    resolveProductIdentity,
    resolveSearchText,
  });

  const focusController = useStockItemScanFocusController({
    barcodeInputRef,
    serialInputRef,
    searchInputRef,
    editSerialInputRef,
  });

  const focusForCurrentState = useCallback(({ barcodeCaptured = false } = {}) => {
    const searchActive = searchInputRef?.current != null && document.activeElement === searchInputRef.current;
    return focusController.focusForState({
      searchActive,
      editingSerial,
      submitting,
      manualSerialMode,
      workingGroup: workingGroupController.workingGroup,
      hasExpectedBarcode: Boolean(workingGroupController.expectedBarcode),
      barcodeCaptured,
    });
  }, [
    editingSerial,
    focusController,
    manualSerialMode,
    searchInputRef,
    submitting,
    workingGroupController.expectedBarcode,
    workingGroupController.workingGroup,
  ]);

  const resolveReceiveInput = useCallback(({ barcodeInput, serialNumber } = {}) =>
    deriveEffectiveReceiveInput({
      barcodeInput,
      expectedBarcode: workingGroupController.expectedBarcode,
      serialNumber,
    }), [workingGroupController.expectedBarcode]);

  return {
    ...workingGroupController,
    ...focusController,
    focusForCurrentState,
    resolveReceiveInput,
  };
};

export default useStockItemScanRuntimeController;
