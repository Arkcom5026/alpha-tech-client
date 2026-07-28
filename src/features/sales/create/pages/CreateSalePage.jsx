import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Archive, Search, ShoppingBag } from 'lucide-react';

import useSalesStore from '@/features/sales/store/salesStore';
import CustomerSection from '../components/CustomerSection';
import PaymentSection from '../components/PaymentSection';
import SaleItemTable from '../components/SaleItemTable';
import { executeSaleCompletion } from '../workflows/saleCompletionWorkflow';
import {
  mapSaleSearchItemToCartLine,
  searchSaleItems,
} from '../../item-search/api/saleItemSearchApi';
import { openCompletedSaleDocument } from '../../documents/services/saleDocumentWorkflow';
import PosHeldCartPanel from '../../held-cart/components/PosHeldCartPanel';
import {
  getPosHeldCart,
  getPosHeldCartErrorMessage,
  revalidatePosHeldCart,
  updatePosHeldCart,
} from '../../held-cart/api/posHeldCartApi';

const round2 = (value) => Number((Number(value) || 0).toFixed(2));

const QuickSalePage = () => {
  const barcodeInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const lastPrintKeyRef = useRef('');
  const autosaveTimerRef = useRef(null);
  const autosavePromiseRef = useRef(Promise.resolve());
  const activeHeldCartRef = useRef(null);

  const [saleItems, setSaleItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState('retail');
  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null);
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');
  const [saleMode, setSaleMode] = useState('CASH');
  const [saleOption, setSaleOption] = useState('NONE');
  const [heldCartPanelOpen, setHeldCartPanelOpen] = useState(false);
  const [activeHeldCart, setActiveHeldCart] = useState(null);
  const [heldCartValidation, setHeldCartValidation] = useState(null);
  const [heldCartSaveState, setHeldCartSaveState] = useState('idle');

  const customerId = useSalesStore((state) => state.customerId);
  const billDiscount = useSalesStore((state) => state.billDiscount);
  const clearSaleErrorAction = useSalesStore((state) => state.clearErrorAction);
  const setCustomerIdAction = useSalesStore((state) => state.setCustomerIdAction);

  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const targetSlug = shopSlug || 'advancetech';

  useEffect(() => {
    if (clearPhoneTrigger) setHideCustomerDetails(false);
  }, [clearPhoneTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => barcodeInputRef.current?.focus?.(), 150);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    activeHeldCartRef.current = activeHeldCart;
  }, [activeHeldCart]);

  const heldSnapshot = (items = saleItems) => ({
    customerId: customerId ? Number(customerId) : null,
    customerName: activeHeldCartRef.current?.customerName || null,
    customerPhone: activeHeldCartRef.current?.customerPhone || null,
    note: activeHeldCartRef.current?.note || null,
    priceType: selectedPriceType,
    items,
  });

  const persistActiveHeldCart = async (items = saleItems) => {
    const pending = autosavePromiseRef.current.then(async () => {
      const cart = activeHeldCartRef.current;
      if (!cart?.id || !items.length) return cart;
      setHeldCartSaveState('saving');
      const updated = await updatePosHeldCart(cart.id, {
        ...heldSnapshot(items),
        expectedVersion: cart.version,
      });
      activeHeldCartRef.current = updated;
      setActiveHeldCart(updated);
      setHeldCartSaveState('saved');
      return updated;
    });
    autosavePromiseRef.current = pending.catch(() => {});
    try {
      return await pending;
    } catch (error) {
      setHeldCartSaveState('failed');
      throw error;
    }
  };

  useEffect(() => {
    if (!activeHeldCart?.id || !saleItems.length) return undefined;
    clearTimeout(autosaveTimerRef.current);
    setHeldCartSaveState('pending');
    autosaveTimerRef.current = setTimeout(() => {
      persistActiveHeldCart(saleItems).catch((error) => {
        setBarcodeError(`❌ Autosave: ${getPosHeldCartErrorMessage(error)}`);
      });
    }, 700);
    return () => clearTimeout(autosaveTimerRef.current);
  }, [activeHeldCart?.id, customerId, saleItems, selectedPriceType]); // eslint-disable-line react-hooks/exhaustive-deps

  const saleItemKeySet = useMemo(
    () => new Set((saleItems || []).map((item) => String(item.lineId))),
    [saleItems]
  );

  const addSaleItem = (item) => {
    setSaleItems((current) => {
      if (current.some((row) => row.lineId === item.lineId)) return current;
      return [...current, item];
    });
  };

  const removeSaleItem = (lineId) => {
    setSaleItems((current) => {
      if (activeHeldCartRef.current?.id && current.length === 1) {
        setBarcodeError('⚠️ ใบพักรายการต้องมีสินค้าอย่างน้อย 1 รายการ หากไม่ต้องการใช้ต่อให้ยกเลิกใบพักรายการ');
        return current;
      }
      return current.filter((item) => item.lineId !== lineId);
    });
  };

  const updateSaleItem = (lineId, nextValues) => {
    setSaleItems((current) => current.map((item) => (
      item.lineId === lineId ? { ...item, ...nextValues } : item
    )));
  };

  const resetBarcodeInput = (input) => {
    if (input) input.value = '';
    requestAnimationFrame(() => barcodeInputRef.current?.focus?.());
  };

  const handleBarcodeSearch = async (event) => {
    clearSaleErrorAction?.();
    if (event.key !== 'Enter') return;

    const barcode = event.target.value.trim();
    if (!barcode) return;
    setBarcodeError('');

    try {
      const result = await searchSaleItems(barcode);
      const foundItem = result.items[0];

      if (!foundItem) {
        setBarcodeError('❌ ไม่พบบาร์โค้ดนี้ในรายการสินค้าที่พร้อมขาย');
        resetBarcodeInput(event.target);
        return;
      }

      const preparedItem = mapSaleSearchItemToCartLine(foundItem, selectedPriceType);
      if (saleItemKeySet.has(preparedItem.lineId)) {
        setBarcodeError('⚠️ บาร์โค้ดนี้ถูกเพิ่มในรายการขายแล้ว');
        resetBarcodeInput(event.target);
        return;
      }

      switch (foundItem.type) {
        case 'STOCK':
        case 'SIMPLE':
          addSaleItem(preparedItem);
          break;
        default:
          throw new Error(`ไม่รองรับประเภทรายการขาย: ${foundItem.type || 'UNKNOWN'}`);
      }

      resetBarcodeInput(event.target);
    } catch (error) {
      const payload = error?.response?.data;
      setBarcodeError(`❌ ${payload?.message || error?.message || 'ระบบค้นหาสินค้าขัดข้อง กรุณาลองใหม่อีกครั้ง'}`);
      resetBarcodeInput(event.target);
    }
  };

  const buildCompletionPayload = (opts = {}) => {
    const vatRate = 7;
    const lines = saleItems.map((item) => {
      const quantity = item.lineType === 'SIMPLE' ? Number(item.quantity || 1) : 1;
      const basePrice = round2((Number(item.price) || 0) * quantity);
      const discount = round2(Number(item.discount) || 0);
      const price = round2(Math.max(basePrice - discount, 0));
      const vatAmount = round2((price * vatRate) / (100 + vatRate));

      return {
        lineId: item.lineId,
        lineType: item.lineType,
        stockItemId: item.lineType === 'STOCK_ITEM' ? Number(item.stockItemId) : null,
        productId: Number(item.productId),
        simpleLotId: item.lineType === 'SIMPLE' ? Number(item.simpleLotId) : null,
        quantity,
        basePrice,
        discount,
        price,
        vatAmount,
        remark: '',
      };
    });

    const totalBeforeDiscount = round2(lines.reduce((sum, line) => sum + line.basePrice, 0));
    const totalDiscount = round2(lines.reduce((sum, line) => sum + line.discount, 0));
    const totalAmount = round2(Math.max(totalBeforeDiscount - totalDiscount, 0));
    const vat = round2((totalAmount * vatRate) / (100 + vatRate));
    const isCredit = saleMode === 'CREDIT';

    return {
      customerId: customerId ? Number(customerId) : null,
      sourceHeldCartId: activeHeldCartRef.current?.id || null,
      totalBeforeDiscount,
      totalDiscount,
      vat,
      vatRate,
      totalAmount,
      note: '',
      lines,
      mode: saleMode,
      saleMode,
      isCredit,
      isTaxInvoice: isCredit ? false : undefined,
      saleType: opts.saleType || undefined,
      deliveryNoteMode: isCredit ? 'PRINT' : opts.deliveryNoteMode,
    };
  };

  const handleConfirmSale = async (opts = {}) => {
    clearSaleErrorAction?.();
    if (saleItems.length === 0 || isSubmitting) return { error: 'ยังไม่มีรายการสินค้าในตะกร้า' };

    if (saleMode === 'CREDIT' && !customerId) {
      return { error: 'การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน' };
    }

    const invalidSimple = saleItems.find((item) => (
      item.lineType === 'SIMPLE' && (
        !item.simpleLotId || !item.productId || Number(item.quantityAvailable) <= 0
      )
    ));
    if (invalidSimple) {
      return { error: 'ข้อมูล SimpleLot ไม่พร้อมสำหรับการขาย', code: 'SIMPLE_LOT_NOT_SELLABLE' };
    }

    try {
      setIsSubmitting(true);
      if (activeHeldCartRef.current?.id) {
        clearTimeout(autosaveTimerRef.current);
        const saved = await persistActiveHeldCart(saleItems);
        const validation = await revalidatePosHeldCart(saved.id);
        setHeldCartValidation(validation);
        if (!validation.ready) {
          return { error: 'ใบพักมีสินค้าที่ไม่พร้อมขาย กรุณาลบหรือเลือกสินค้าทดแทน', code: 'HELD_CART_ITEM_UNAVAILABLE' };
        }
      }
      const data = await executeSaleCompletion({
        sale: buildCompletionPayload(opts),
        payment: opts.paymentIntent || { paymentItems: [] },
      });
      const saleId = data?.saleId ?? data?.id ?? data?.sale?.id ?? null;
      return { saleId, data, deliveryNoteMode: saleMode === 'CREDIT' ? 'PRINT' : undefined };
    } catch (error) {
      const payload = error?.response?.data;
      return {
        error: payload?.message || error?.message || 'ยืนยันการขายล้มเหลว',
        code: payload?.code || error?.code,
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaleConfirmed = (saleId, option, printContext = {}) => {
    const finalOption = option || saleOption;

    if (saleId && finalOption && finalOption !== 'NONE') {
      const printKey = `${String(saleId)}::${String(finalOption)}`;
      if (lastPrintKeyRef.current !== printKey) {
        const opened = openCompletedSaleDocument({
          shopSlug: targetSlug,
          saleId,
          option: finalOption,
          reservedWindow: printContext?.printWindow,
          navigate,
          lastDocumentKey: lastPrintKeyRef.current,
        });
        if (opened.opened) lastPrintKeyRef.current = opened.documentKey;
      }
    }

    setSaleItems([]);
    activeHeldCartRef.current = null;
    setActiveHeldCart(null);
    setHeldCartValidation(null);
    setHeldCartSaveState('idle');
    setTimeout(() => {
      setHideCustomerDetails(true);
      barcodeInputRef.current?.focus?.();
    }, 200);
  };

  const loadHeldCart = async (heldCartId) => {
    if (saleItems.length && !window.confirm('หน้าขายมีรายการอยู่ กด “ยกเลิก” แล้วพักรายการปัจจุบันก่อน หรือกด “ตกลง” เพื่อแทนที่ด้วยใบพักที่เลือก')) return;
    try {
      const [cart, validation] = await Promise.all([
        getPosHeldCart(heldCartId),
        revalidatePosHeldCart(heldCartId),
      ]);
      const validationByKey = new Map((validation.lines || []).map((item) => [item.lineKey, item]));
      const restored = (cart.lines || []).map((line) => ({
        lineId: line.lineKey,
        lineType: line.lineType,
        type: line.lineType === 'STOCK_ITEM' ? 'STOCK' : 'SIMPLE',
        stockItemId: line.stockItemId,
        simpleLotId: line.simpleLotId,
        productId: line.productId,
        quantity: Number(line.quantity),
        quantityAvailable: Number(line.quantity),
        barcode: line.barcode || '',
        productName: line.productName || '',
        model: line.modelName || '',
        price: Number(line.unitPrice),
        originalPrice: Number(line.unitPrice),
        sellingPrice: Number(line.unitPrice),
        discount: Number(line.discount || 0),
        discountWithoutBill: Number(line.discount || 0),
        billShare: 0,
        heldCartAvailability: validationByKey.get(line.lineKey) || null,
      }));
      activeHeldCartRef.current = cart;
      setActiveHeldCart(cart);
      setHeldCartValidation(validation);
      setSaleItems(restored);
      setSelectedPriceType(cart.priceType || 'retail');
      setCustomerIdAction?.(cart.customerId || null);
      setHeldCartPanelOpen(false);
      setHeldCartSaveState('saved');
      if (!validation.ready) setBarcodeError('⚠️ ใบพักมีสินค้าที่ไม่พร้อมขาย กรุณาลบหรือเลือกสินค้าทดแทน');
      else if (validation.priceChanged) setBarcodeError('⚠️ ราคาปัจจุบันเปลี่ยนจากวันที่พักรายการ กรุณาตรวจสอบก่อนขาย');
      else setBarcodeError('');
      requestAnimationFrame(() => barcodeInputRef.current?.focus?.());
    } catch (error) {
      setBarcodeError(`❌ ${getPosHeldCartErrorMessage(error)}`);
    }
  };

  const heldCartSavedAndClear = () => {
    setSaleItems([]);
    setCustomerIdAction?.(null);
    setHeldCartValidation(null);
    setActiveHeldCart(null);
    activeHeldCartRef.current = null;
    setHeldCartSaveState('idle');
    setTimeout(() => barcodeInputRef.current?.focus?.(), 100);
  };

  return (
    <div className="w-full h-full p-2 md:p-3 space-y-3 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn text-xs md:text-sm antialiased font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2.5">
        <div>
          <strong className="text-orange-800">{activeHeldCart ? `กำลังทำต่อ ${activeHeldCart.code}` : 'รายการขายใหม่'}</strong>
          {activeHeldCart && <span className="ml-2 text-[10px] font-bold text-orange-600">{heldCartSaveState === 'saving' ? 'กำลังบันทึก...' : heldCartSaveState === 'failed' ? 'บันทึกไม่สำเร็จ' : heldCartSaveState === 'pending' ? 'รอบันทึก' : 'บันทึกอัตโนมัติแล้ว'}</span>}
        </div>
        <button type="button" onClick={() => setHeldCartPanelOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white"><Archive size={16} /> พักรายการ / เปิดใบจอง</button>
      </div>
      {activeHeldCart && heldCartValidation && (
        <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${heldCartValidation.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {heldCartValidation.ready ? 'สินค้าจากใบพักยังพร้อมขาย' : `มีสินค้าไม่พร้อม ${(heldCartValidation.lines || []).filter((item) => !item.available).length} รายการ`}
          {heldCartValidation.priceChanged ? ' · มีราคาเปลี่ยน กรุณาตรวจสอบ' : ''}
        </div>
      )}
      <div className="grid grid-cols-12 gap-3 items-start">
        <div className="col-span-12 lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
            <CustomerSection
              phoneInputRef={phoneInputRef}
              productSearchRef={barcodeInputRef}
              clearTrigger={clearPhoneTrigger}
              onClearFinish={() => setClearPhoneTrigger(null)}
              key={clearPhoneTrigger}
              hideCustomerDetails={hideCustomerDetails}
              onSaleModeSelect={setSaleMode}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 select-none">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-slate-900/5 text-slate-800 rounded-md">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-xs md:text-sm font-black text-slate-900">ตัวเลือกการคำนวณและโครงสร้างบาร์โค้ดขาย</h2>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-black text-slate-400">
                <div className="flex gap-3.5 items-center">
                  {['wholesale', 'technician', 'retail'].map((type) => (
                    <label key={type} className="flex items-center gap-1 cursor-pointer hover:text-slate-700 transition-colors">
                      <input
                        type="radio"
                        value={type}
                        checked={selectedPriceType === type}
                        onChange={(e) => setSelectedPriceType(e.target.value)}
                        className="accent-slate-900 h-3.5 w-3.5"
                      />
                      <span className={selectedPriceType === type ? 'text-slate-900 font-black' : ''}>
                        {type === 'wholesale' ? 'ราคาส่ง' : type === 'technician' ? 'ราคาช่าง' : 'ราคาปลีก'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative pt-0.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 transform -translate-y-1/2" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="ยิงบาร์โค้ดสินค้าแบบชิ้นหรือแบบจำนวนเพื่อเพิ่มรายการขาย..."
                onKeyDown={handleBarcodeSearch}
                className="h-8 w-full pl-9 pr-4 text-xs font-mono font-black bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none shadow-inner transition-all"
              />
            </div>

            {barcodeError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600 font-black text-[11px] animate-slideUp">
                {barcodeError}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-h-[380px] flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider select-none">รายการสินค้าในตะกร้าขาย</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <SaleItemTable
                  items={saleItems}
                  onRemove={removeSaleItem}
                  onUpdate={updateSaleItem}
                  billDiscount={billDiscount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
        <PaymentSection
          saleItems={saleItems}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          onSaleConfirmed={handleSaleConfirmed}
          setClearPhoneTrigger={setClearPhoneTrigger}
          currentSaleMode={saleMode}
          onSaleModeChange={setSaleMode}
          saleOption={saleOption}
          onSaleOptionChange={setSaleOption}
          onConfirmSale={handleConfirmSale}
        />
      </div>
      <PosHeldCartPanel
        open={heldCartPanelOpen}
        onClose={() => setHeldCartPanelOpen(false)}
        currentItems={saleItems}
        currentCustomerId={customerId}
        currentPriceType={selectedPriceType}
        onLoad={loadHeldCart}
        onSavedAndClear={heldCartSavedAndClear}
      />
    </div>
  );
};

export default QuickSalePage;
