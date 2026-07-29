import { useCallback } from 'react';

import {
  mapSaleSearchItemToCartLine,
  searchSaleItems,
} from '../../../item-search/api/saleItemSearchApi';

const DEFAULT_SEARCH_ERROR = 'ระบบค้นหาสินค้าขัดข้อง กรุณาลองใหม่อีกครั้ง';

export const useSaleItemSearch = ({
  selectedPriceType,
  itemKeySet,
  addItem,
  clearSaleError,
  setError,
  productSearchRef,
}) => {
  const resetInput = useCallback((input) => {
    if (input) input.value = '';
    requestAnimationFrame(() => productSearchRef?.current?.focus?.());
  }, [productSearchRef]);

  const handleBarcodeSearch = useCallback(async (event) => {
    clearSaleError?.();
    if (event.key !== 'Enter') return;

    const barcode = event.target.value.trim();
    if (!barcode) return;
    setError('');

    try {
      const result = await searchSaleItems(barcode);
      const foundItem = result.items[0];

      if (!foundItem) {
        setError('❌ ไม่พบบาร์โค้ดนี้ในรายการสินค้าที่พร้อมขาย');
        resetInput(event.target);
        return;
      }

      const preparedItem = mapSaleSearchItemToCartLine(foundItem, selectedPriceType);
      if (itemKeySet.has(preparedItem.lineId)) {
        if (preparedItem.lineType === 'SIMPLE') {
          addItem(preparedItem);
          resetInput(event.target);
          return;
        }

        setError('⚠️ บาร์โค้ดนี้ถูกเพิ่มในรายการขายแล้ว');
        resetInput(event.target);
        return;
      }

      switch (foundItem.type) {
        case 'STOCK':
        case 'SIMPLE':
          addItem(preparedItem);
          break;
        default:
          throw new Error(`ไม่รองรับประเภทรายการขาย: ${foundItem.type || 'UNKNOWN'}`);
      }

      resetInput(event.target);
    } catch (error) {
      const payload = error?.response?.data;
      setError(`❌ ${payload?.message || error?.message || DEFAULT_SEARCH_ERROR}`);
      resetInput(event.target);
    }
  }, [
    addItem,
    clearSaleError,
    itemKeySet,
    resetInput,
    selectedPriceType,
    setError,
  ]);

  return {
    handleBarcodeSearch,
    resetInput,
  };
};
