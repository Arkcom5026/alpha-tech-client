import { useCallback } from 'react';
import useStockItemScanFocusController from './useStockItemScanFocusController';
import useStockItemWorkingGroupController from './useStockItemWorkingGroupController';
import {
  deriveEffectiveReceiveInput,
  STOCK_ITEM_WORKING_GROUP,
} from '../policies/stockItemScanWorkflowPolicy';

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

  const resolveReceiveInput = useCallback(({ barcodeInput, serialNumber } = {}) => {
    const canUseExpectedBarcode =
      manualSerialMode &&
      workingGroupController.workingGroup === STOCK_ITEM_WORKING_GROUP.SINGLE_PRODUCT;

    return deriveEffectiveReceiveInput({
      barcodeInput,
      expectedBarcode: canUseExpectedBarcode ? workingGroupController.expectedBarcode : '',
      serialNumber,
    });
  }, [
    manualSerialMode,
    workingGroupController.expectedBarcode,
    workingGroupController.workingGroup,
  ]);

  return {
    ...workingGroupController,
    ...focusController,
    focusForCurrentState,
    resolveReceiveInput,
  };
};

export default useStockItemScanRuntimeController;
