import { useCallback, useMemo, useState } from 'react';

import { canRemoveSaleItemFromHeldCart } from '../../held-cart';

const LAST_HELD_CART_LINE_MESSAGE =
  '⚠️ ใบพักรายการต้องมีสินค้าอย่างน้อย 1 รายการ หากไม่ต้องการใช้ต่อให้ยกเลิกใบพักรายการ';

export const useSaleCartEditor = ({
  activeHeldCart,
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
      if (current.some((row) => row.lineId === item.lineId)) return current;
      return [...current, item];
    });
  }, []);

  const remove = useCallback((lineId) => {
    setItems((current) => {
      if (!canRemoveSaleItemFromHeldCart({
        activeHeldCart,
        itemCount: current.length,
      })) {
        onError?.(LAST_HELD_CART_LINE_MESSAGE);
        return current;
      }
      return current.filter((item) => item.lineId !== lineId);
    });
  }, [activeHeldCart, onError]);

  const update = useCallback((lineId, nextValues) => {
    setItems((current) => current.map((item) => (
      item.lineId === lineId ? { ...item, ...nextValues } : item
    )));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return {
    items,
    setItems,
    itemKeySet,
    add,
    remove,
    update,
    clear,
  };
};
