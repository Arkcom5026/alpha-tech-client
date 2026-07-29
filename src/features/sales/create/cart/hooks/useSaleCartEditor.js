import { useCallback, useMemo, useState } from 'react';

import { canRemoveSaleItemFromHeldCart } from '../../held-cart';
import {
  clampSimpleQuantity,
  incrementSimpleQuantity,
  isSimpleSaleLine,
} from '../services/saleCartQuantityPolicy';

const LAST_HELD_CART_LINE_MESSAGE =
  '⚠️ ใบพักรายการต้องมีสินค้าอย่างน้อย 1 รายการ หากไม่ต้องการใช้ต่อให้ยกเลิกใบพักรายการ';

export const useSaleCartEditor = ({
  activeHeldCart,
  activeHeldCartRef,
  onError,
  initialItems = [],
} = {}) => {
  const [items, setItems] = useState(initialItems);

  const itemKeySet = useMemo(
    () => new Set((items || []).map((item) => String(item.lineId))),
    [items]
  );

  const add = useCallback((item) => {
    setItems((current) => {
      const existing = current.find((row) => row.lineId === item.lineId);
      if (existing) {
        if (!isSimpleSaleLine(existing) || !isSimpleSaleLine(item)) return current;

        const quantityAvailable = Number(item.quantityAvailable ?? existing.quantityAvailable);
        const next = incrementSimpleQuantity({ ...existing, quantityAvailable });
        if (next.limited) {
          onError?.(`จำนวนสินค้าในล็อตคงเหลือ ${next.available} หน่วย`);
          return current;
        }

        return current.map((row) => (
          row.lineId === item.lineId
            ? { ...row, quantity: next.quantity, quantityAvailable }
            : row
        ));
      }
      return [...current, item];
    });
  }, [onError]);

  const remove = useCallback((lineId) => {
    setItems((current) => {
      const heldCartAuthority = activeHeldCartRef?.current || activeHeldCart;
      if (!canRemoveSaleItemFromHeldCart({
        activeHeldCart: heldCartAuthority,
        itemCount: current.length,
      })) {
        onError?.(LAST_HELD_CART_LINE_MESSAGE);
        return current;
      }
      return current.filter((item) => item.lineId !== lineId);
    });
  }, [activeHeldCart, activeHeldCartRef, onError]);

  const update = useCallback((lineId, nextValues) => {
    setItems((current) => current.map((item) => (
      item.lineId === lineId ? { ...item, ...nextValues } : item
    )));
  }, []);

  const setSimpleQuantity = useCallback((lineId, requestedQuantity) => {
    setItems((current) => current.map((item) => {
      if (item.lineId !== lineId || !isSimpleSaleLine(item)) return item;

      const next = clampSimpleQuantity(item, requestedQuantity);
      if (next.limited && Number(requestedQuantity) > next.available) {
        onError?.(`จำนวนสินค้าในล็อตคงเหลือ ${next.available} หน่วย`);
      }
      return { ...item, quantity: next.quantity };
    }));
  }, [onError]);

  const clear = useCallback(() => setItems([]), []);

  return {
    items,
    setItems,
    itemKeySet,
    add,
    remove,
    update,
    setSimpleQuantity,
    clear,
  };
};
