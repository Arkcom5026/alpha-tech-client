import { useCallback, useRef, useState } from 'react';

export const useSaleHeldCart = () => {
  const activeHeldCartRef = useRef(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeHeldCart, setActiveHeldCart] = useState(null);
  const [validation, setValidation] = useState(null);
  const [saveState, setSaveState] = useState('idle');

  const setActiveCart = useCallback((cart) => {
    activeHeldCartRef.current = cart || null;
    setActiveHeldCart(cart || null);
  }, []);

  const clearActiveCart = useCallback(() => {
    activeHeldCartRef.current = null;
    setActiveHeldCart(null);
    setValidation(null);
    setSaveState('idle');
  }, []);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return {
    activeHeldCartRef,
    panelOpen,
    activeHeldCart,
    validation,
    saveState,
    setActiveCart,
    clearActiveCart,
    setValidation,
    setSaveState,
    openPanel,
    closePanel,
  };
};