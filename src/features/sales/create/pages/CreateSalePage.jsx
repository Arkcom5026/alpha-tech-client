import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';

import useSalesStore from '@/features/sales/store/salesStore';
import { useCreateSaleWorkflow } from '../index';
import { SaleCustomerSection as CustomerSection } from '../customer';
import PaymentSection from '../components/PaymentSection';
import SaleItemTable from '../components/SaleItemTable';
import PosHeldCartPanel from '../../held-cart/components/PosHeldCartPanel';

const QuickSalePage = () => {
  const barcodeInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null);
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false);

  const customerId = useSalesStore((state) => state.customerId);
  const billDiscount = useSalesStore((state) => state.billDiscount);
  const clearSaleErrorAction = useSalesStore((state) => state.clearErrorAction);
  const setCustomerIdAction = useSalesStore((state) => state.setCustomerIdAction);

  const { shopSlug } = useParams();
  const navigate = useNavigate();
  const targetSlug = shopSlug || 'advancetech';

  const sale = useCreateSaleWorkflow({
    customerId,
    setCustomerId: setCustomerIdAction,
    billDiscount,
    clearSaleError: clearSaleErrorAction,
    shopSlug: targetSlug,
    navigate,
    productSearchRef: barcodeInputRef,
    setHideCustomerDetails,
  });

  useEffect(() => {
    if (clearPhoneTrigger) setHideCustomerDetails(false);
  }, [clearPhoneTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => barcodeInputRef.current?.focus?.(), 150);
    return () => clearTimeout(timer);
  }, []);

  const heldCartSavedAndClear = () => {
    sale.cart.clear();
    sale.customer.setCustomerId?.(null);
    sale.heldCart.commands.clearActiveCart();
    setTimeout(() => barcodeInputRef.current?.focus?.(), 100);
  };

  return (
    <div className="w-full h-full p-2 md:p-3 space-y-3 max-w-[1600px] mx-auto text-slate-800 selection:bg-orange-500 selection:text-white animate-fadeIn text-xs md:text-sm antialiased font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2.5">
        <div>
          <strong className="text-orange-800">
            {sale.heldCart.panel.activeCart ? `กำลังทำต่อ ${sale.heldCart.panel.activeCart.code}` : 'รายการขายใหม่'}
          </strong>
          {sale.heldCart.panel.activeCart && (
            <span className="ml-2 text-[10px] font-bold text-orange-600">
              {sale.heldCart.panel.saveState === 'saving'
                ? 'กำลังบันทึก...'
                : sale.heldCart.panel.saveState === 'failed'
                  ? 'บันทึกไม่สำเร็จ'
                  : sale.heldCart.panel.saveState === 'pending'
                    ? 'รอบันทึก'
                    : 'บันทึกอัตโนมัติแล้ว'}
            </span>
          )}
        </div>
      </div>

      {sale.heldCart.panel.activeCart && sale.heldCart.panel.validation && (
        <div className={`rounded-xl border px-3 py-2 text-xs font-bold ${sale.heldCart.panel.validation.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {sale.heldCart.panel.validation.ready
            ? 'สินค้าจากใบพักยังพร้อมขาย'
            : `มีสินค้าไม่พร้อม ${(sale.heldCart.panel.validation.lines || []).filter((item) => !item.available).length} รายการ`}
          {sale.heldCart.panel.validation.priceChanged ? ' · มีราคาเปลี่ยน กรุณาตรวจสอบ' : ''}
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
              onSaleModeSelect={sale.presentation.setSaleMode}
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
                        checked={sale.presentation.selectedPriceType === type}
                        onChange={(event) => sale.presentation.setSelectedPriceType(event.target.value)}
                        className="accent-slate-900 h-3.5 w-3.5"
                      />
                      <span className={sale.presentation.selectedPriceType === type ? 'text-slate-900 font-black' : ''}>
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
                onKeyDown={sale.itemSearch.handleBarcodeSearch}
                className="h-8 w-full pl-9 pr-4 text-xs font-mono font-black bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-900 rounded-lg outline-none shadow-inner transition-all"
              />
            </div>

            {sale.itemSearch.error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-rose-600 font-black text-[11px] animate-slideUp">
                {sale.itemSearch.error}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm min-h-[380px] flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wider select-none">รายการสินค้าในตะกร้าขาย</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <SaleItemTable
                  items={sale.cart.items}
                  onRemove={sale.cart.remove}
                  onUpdate={sale.cart.update}
                  onChangeSimpleQuantity={sale.cart.setSimpleQuantity}
                  billDiscount={sale.presentation.billDiscount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-1">
        <PaymentSection
          saleItems={sale.cart.items}
          isSubmitting={sale.completion.isSubmitting}
          recovery={sale.completion.recovery}
          onSaleConfirmed={sale.documentHandoff.handleConfirmed}
          setClearPhoneTrigger={setClearPhoneTrigger}
          currentSaleMode={sale.presentation.saleMode}
          onSaleModeChange={sale.presentation.setSaleMode}
          saleOption={sale.documentHandoff.saleOption}
          onSaleOptionChange={sale.documentHandoff.setSaleOption}
          onConfirmSale={sale.completion.confirm}
          onSaveHeldCart={sale.heldCart.commands.openPanel}
        />
      </div>

      <PosHeldCartPanel
        open={sale.heldCart.panel.open}
        onClose={sale.heldCart.commands.closePanel}
        currentItems={sale.cart.items}
        currentCustomerId={sale.customer.customerId}
        currentPriceType={sale.presentation.selectedPriceType}
        onLoad={sale.heldCart.commands.load}
        onSavedAndClear={heldCartSavedAndClear}
      />
    </div>
  );
};

export default QuickSalePage;
