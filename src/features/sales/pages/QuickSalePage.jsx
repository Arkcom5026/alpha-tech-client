// src/features/sales/pages/QuickSalePage.jsx
// 🏛️ Premium Next-Gen POS Sales Master Center: (Unified Pure Core Single-File Edition)

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSalesStore from '@/features/sales/store/salesStore';
import useStockItemStore from '@/features/stockItem/store/stockItemStore';

import CustomerSection from '../components/CustomerSection';
import PaymentSection from '../components/PaymentSection';
import SaleItemTable from '../components/SaleItemTable';
import { ShoppingBag, Search } from 'lucide-react';

const QuickSalePage = () => {
  const barcodeInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState('retail');
  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null);
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false);

  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const targetSlug = shopSlug || 'advancetech';

  useEffect(() => {
    if (clearPhoneTrigger) setHideCustomerDetails(false);
  }, [clearPhoneTrigger]);

  const [barcodeError, setBarcodeError] = useState('');
  const [saleMode, setSaleMode] = useState('CASH');
  const [saleOption, setSaleOption] = useState('NONE');

  const {
    saleItems,
    addSaleItemAction,
    removeSaleItemAction,
    confirmSaleOrderAction,
    sharedBillDiscountPerItem,
    billDiscount,
    error: saleError,
    clearErrorAction: clearSaleErrorAction,
  } = useSalesStore();

  const {
    searchStockItemAction,
    error: stockError,
    clearErrorAction: clearStockErrorAction,
  } = useStockItemStore();

  // 🟢 [PURE FOCUS HIJACKING]: สแตนด์บายโฟกัสรอที่ช่องยิงบาร์โค้ดตั้งแต่เสี้ยววินาทีแรก
  useEffect(() => {
    const t = setTimeout(() => {
      barcodeInputRef.current?.focus?.();
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const saleItemKeySet = useMemo(() => {
    const s = new Set();
    (saleItems || []).forEach((it) => {
      const sid = it?.stockItemId;
      const bc = it?.barcode;
      if (sid != null) s.add(`SID:${String(sid)}`);
      if (bc) s.add(`BC:${String(bc).trim()}`);
    });
    return s;
  }, [saleItems]);

  const handleBarcodeSearch = async (e) => {
    clearSaleErrorAction?.();
    clearStockErrorAction?.();

    if (e.key !== 'Enter') return;

    const barcode = e.target.value.trim();
    if (!barcode) return;

    setBarcodeError('');

    try {
      const result = await searchStockItemAction(barcode);

      if (result?.notSellable) {
        const status = result.status || 'UNKNOWN';
        if (status === 'SOLD') {
          setBarcodeError(`❌ บาร์โค้ด ${barcode} สินค้าชิ้นนี้ขายแล้ว`);
        } else {
          setBarcodeError(`❌ สินค้านี้ไม่พร้อมขาย (สถานะ: ${status})`);
        }
        e.target.value = '';
        barcodeInputRef.current?.focus();
        return;
      }

      const foundItem = Array.isArray(result) ? result[0] : result;

      if (!foundItem) {
        setBarcodeError('❌ ไม่พบบาร์โค้ดนี้ในระบบคลังสินค้า');
        e.target.value = '';
        barcodeInputRef.current?.focus();
        return;
      }

      if (foundItem.kind === 'LOT' || foundItem.simpleLotId || !foundItem.id || !foundItem.barcode) {
        setBarcodeError('❌ สินค้าประเภทจำนวน/LOT ยังไม่รองรับในหน้าขายนี้ กรุณาใช้สินค้าที่มี SN ก่อน');
        e.target.value = '';
        barcodeInputRef.current?.focus();
        return;
      }

      const status = foundItem.status || foundItem.stockItem?.status;
      if (status && status !== 'IN_STOCK') {
        if (status === 'SOLD') {
          setBarcodeError(`❌ บาร์โค้ด ${barcode} สินค้าชิ้นนี้ขายแล้ว`);
        } else {
          setBarcodeError(`❌ สินค้านี้ไม่พร้อมขาย (สถานะ: ${status})`);
        }
        e.target.value = '';
        barcodeInputRef.current?.focus();
        return;
      }

      const duplicated = saleItemKeySet.has(`SID:${String(foundItem.id)}`) || (foundItem.barcode && saleItemKeySet.has(`BC:${String(foundItem.barcode).trim()}`));
      if (duplicated) {
        setBarcodeError('⚠️ บาร์โค้ดนี้ถูกเพิ่มในรายการขายในตะกร้าปัจจุบันแล้ว');
        e.target.value = '';
        barcodeInputRef.current?.focus();
        return;
      }

      const preparedItem = {
        stockItemId: foundItem.id,
        barcode: foundItem.barcode,
        productName: foundItem.product?.name || '',
        model: foundItem.product?.model || '',
        price: foundItem.prices?.[selectedPriceType] || 0,
        originalPrice: foundItem.prices?.[selectedPriceType] || 0,
        sellingPrice: foundItem.prices?.[selectedPriceType] || 0,
        discount: 0,
        discountWithoutBill: 0,
        billShare: 0,
      };

      addSaleItemAction(preparedItem);
      e.target.value = '';
      
      requestAnimationFrame(() => {
        barcodeInputRef.current?.focus?.();
      });
    } catch {
      setBarcodeError('❌ ระบบค้นหาสินค้าขัดข้อง กรุณาลองใหม่อีกครั้ง');
      e.target.value = '';
      barcodeInputRef.current?.focus();
    }
  };

  const handleConfirmSale = async (opts = {}) => {
    clearSaleErrorAction?.();
    if (saleItems.length === 0 || isSubmitting) return { error: 'ยังไม่มีรายการสินค้าในตะกร้า' };

    try {
      setIsSubmitting(true);
      const res = await confirmSaleOrderAction(saleMode, opts);
      if (res?.error) return res;
      return { saleId: res?.saleId, data: res?.data };
    } catch (err) {
      return { error: err?.message || 'ยืนยันการขายล้มเหลว' };
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastPrintKeyRef = useRef('');

  const handleSaleConfirmed = (saleId, option) => {
    const finalOption = option || saleOption;

    if (saleId && finalOption && finalOption !== 'NONE') {
      const printKey = `${String(saleId)}::${String(finalOption)}`;
      if (lastPrintKeyRef.current === printKey) return;

      let printUrl = '';
      if (finalOption === 'RECEIPT') {
        // 🟢 FIXED: ซ่อมแซมสับเปลี่ยนพาสพิมพ์สลิปสั้นให้ผูกวิ่งตาม Dynamic targetSlug สาขาคู่ค้าจริง
        printUrl = `/${targetSlug}/pos/sales/bill/print-short/${saleId}`;
      } else if (finalOption === 'TAX_INVOICE') {
        // 🟢 FIXED: ซ่อมแซมสับเปลี่ยนพาสพิมพ์สลิปเต็มใบภาษีให้ผูกวิ่งตาม Dynamic targetSlug สาขาคู่ค้าจริง
        printUrl = `/${targetSlug}/pos/sales/bill/print-full/${saleId}`;
      } else if (finalOption === 'DELIVERY_NOTE') {
        setBarcodeError('ℹ️ ใบส่งของยังไม่พร้อมใช้งานในเวอร์ชันนี้');
        printUrl = '';
      }

      if (printUrl) {
        lastPrintKeyRef.current = printKey;
        window.open(printUrl, '_blank', 'noopener,noreferrer');
      }
    }

    setTimeout(() => {
      setHideCustomerDetails(true);
      barcodeInputRef.current?.focus?.();
    }, 200);
  };

  return (
    <div className="w-full h-full p-2 md:p-3 space-y-3 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn text-xs md:text-sm antialiased font-sans">
      <div className="grid grid-cols-12 gap-3 items-start">
        
        {/* คอนเซปต์ฝั่งซ้าย: ข้อมูลลูกค้า (Always-On) */}
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

        {/* คอนเซปต์ฝั่งขวา: คอนโซลสแกนและตารางพัสดุ */}
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
                      <span className={selectedPriceType === type ? "text-slate-900 font-black" : ""}>
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
                placeholder="ใช้เครื่องยิงบาร์โค้ดโรงงาน หรือระบุชุดซีเรียลพัสดุสินค้าตรงนี้เพื่อทำรายการ..."
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
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider select-none">รายการพัสดุสินค้าในตะกร้าขาย</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <SaleItemTable
                  items={saleItems}
                  onRemove={removeSaleItemAction}
                  sharedBillDiscountPerItem={sharedBillDiscountPerItem}
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
    </div>
  );
};

export default QuickSalePage;