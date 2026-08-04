import { useCallback, useReducer } from 'react';

import {
  mapSaleSearchItemToCartLine,
  searchSaleItems,
} from '../../../item-search/api/saleItemSearchApi';

const DEFAULT_SEARCH_ERROR = 'ระบบค้นหาสินค้าขัดข้อง กรุณาลองใหม่อีกครั้ง';
const CLOSED_SELECTION = Object.freeze({
  open: false,
  query: '',
  items: [],
  truncated: false,
});

const selectionReducer = (_state, action) => {
  if (action.type === 'OPEN') {
    return {
      open: true,
      query: action.query,
      items: action.items,
      truncated: action.truncated,
    };
  }
  return CLOSED_SELECTION;
};

export const useSaleItemSearch = ({
  selectedPriceType,
  itemKeySet,
  addItem,
  clearSaleError,
  setError,
  productSearchRef,
}) => {
  const [selection, dispatchSelection] = useReducer(selectionReducer, CLOSED_SELECTION);

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => productSearchRef?.current?.focus?.());
  }, [productSearchRef]);

  const clearInput = useCallback((input) => {
    if (input) input.value = '';
    focusSearch();
  }, [focusSearch]);

  const addSearchItem = useCallback((foundItem) => {
    switch (foundItem?.type) {
      case 'STOCK':
      case 'SIMPLE':
        break;
      default:
        throw new Error(`ไม่รองรับประเภทรายการขาย: ${foundItem?.type || 'UNKNOWN'}`);
    }

    const preparedItem = mapSaleSearchItemToCartLine(foundItem, selectedPriceType);
    if (itemKeySet.has(preparedItem.lineId)) {
      if (preparedItem.lineType === 'SIMPLE') {
        addItem(preparedItem);
        return true;
      }
      setError('⚠️ สินค้าชิ้นนี้ถูกเพิ่มในรายการขายแล้ว');
      return false;
    }

    addItem(preparedItem);
    return true;
  }, [addItem, itemKeySet, selectedPriceType, setError]);

  const closeSelection = useCallback(() => {
    dispatchSelection({ type: 'CLOSE' });
    focusSearch();
  }, [focusSearch]);

  const selectSearchItem = useCallback((item) => {
    setError('');
    addSearchItem(item);
    closeSelection();
  }, [addSearchItem, closeSelection, setError]);

  const handleBarcodeSearch = useCallback(async (event) => {
    clearSaleError?.();
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const query = event.target.value.trim();
    if (!query) return;
    setError('');

    try {
      const result = await searchSaleItems(query);
      if (!result.items.length) {
        setError(`❌ ${result.message || 'ไม่พบสินค้าที่พร้อมขายจากข้อมูลค้นหานี้'}`);
        return;
      }

      if (result.autoSelect && result.items.length === 1) {
        addSearchItem(result.items[0]);
        clearInput(event.target);
        return;
      }

      dispatchSelection({
        type: 'OPEN',
        query: result.query || query,
        items: result.items,
        truncated: result.truncated,
      });
      clearInput(event.target);
    } catch (error) {
      const payload = error?.response?.data;
      setError(`❌ ${payload?.message || error?.message || DEFAULT_SEARCH_ERROR}`);
      focusSearch();
    }
  }, [
    addSearchItem,
    clearInput,
    clearSaleError,
    focusSearch,
    setError,
  ]);

  return {
    handleBarcodeSearch,
    resetInput: clearInput,
    selection,
    closeSelection,
    selectSearchItem,
  };
};
