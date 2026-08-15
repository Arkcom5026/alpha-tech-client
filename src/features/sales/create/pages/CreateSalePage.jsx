import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import useSalesStore from '@/features/sales/store/salesStore';
import { useCreateSaleWorkflow } from '../index';
import { SaleCustomerSection as CustomerSection } from '../customer';
import PaymentSection from '../components/PaymentSection';
import SaleItemTable from '../components/SaleItemTable';
import SaleWorkspacePanel from '../components/workspace/SaleWorkspacePanel';
import SaleWorkspaceHeader from '../components/workspace/SaleWorkspaceHeader';
import SalePriceTypeSelector from '../components/workspace/SalePriceTypeSelector';
import SaleItemSearchDialog from '../item-search/components/SaleItemSearchDialog';
import PosHeldCartPanel from '../../held-cart/components/PosHeldCartPanel';
import CoreSalesHelpDrawer from '../../help/CoreSalesHelpDrawer';

const QuickSalePage = ({
  initialItems = [],
  sourceContext = null,
  sourceLocked = false,
  saleExecutionDisabled = false,
}) => {
  const barcodeInputRef = useRef(null);
  const phoneInputRef = useRef(null);

  const [clearPhoneTrigger, setClearPhoneTrigger] = useState(null);
  const [hideCustomerDetails, setHideCustomerDetails] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
    initialItems,
  });

  const checkoutLocked = Boolean(
    sale.completion.isSubmitting || sale.completion.recovery?.preserveCheckout
  );
  const cartLocked = checkoutLocked || sourceLocked;

  useEffect(() => {
    if (clearPhoneTrigger) setHideCustomerDetails(false);
  }, [clearPhoneTrigger]);

  useEffect(() => {
    if (sourceLocked) return undefined;
    const timer = setTimeout(() => barcodeInputRef.current?.focus?.(), 150);
    return () => clearTimeout(timer);
  }, [sourceLocked]);

  const heldCartSavedAndClear = () => {
    if (checkoutLocked || sourceLocked) return;
    sale.cart.clear();
    sale.customer.setCustomerId?.(null);
    sale.heldCart.commands.clearActiveCart();
    setTimeout(() => barcodeInputRef.current?.focus?.(), 100);
  };

  const activeHeldCart = sale.heldCart.panel.activeCart;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1560px] flex-col gap-3 p-2.5 text-slate-800 selection:bg-teal-200 selection:text-teal-950 md:p-4 xl:h-[calc(100dvh-4rem)] xl:min-h-0 xl:overflow-hidden">
      <SaleWorkspaceHeader
        title="ขายสินค้า"
        description="ค้นหาลูกค้าและสินค้า ตรวจสอบรายการ แล้วดำเนินการชำระเงินในพื้นที่งานเดียว"
        status={sourceLocked ? 'รายการสินค้าถูกล็อกจากใบจอง' : 'พร้อมสร้างรายการขาย'}
        tone={sourceLocked ? 'info' : 'good'}
        onHelp={() => setIsHelpOpen(true)}
      />

      {sourceContext && (
        <div className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
          รายการสินค้าถูกอ้างอิงจากใบจองเดิม จำนวน ราคา และรายการสต๊อกจึงถูกล็อกไว้จนกว่าจะยืนยันการขาย
        </div>
      )}

      {activeHeldCart && sale.heldCart.panel.validation && (
        <div
          className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-medium ${
            sale.heldCart.panel.validation.ready
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {sale.heldCart.panel.validation.ready
            ? 'สินค้าจากรายการพักยังพร้อมขาย'
            : `มีสินค้าไม่พร้อม ${(sale.heldCart.panel.validation.lines || []).filter((item) => !item.available).length} รายการ`}
          {sale.heldCart.panel.validation.priceChanged ? ' · มีราคาเปลี่ยน กรุณาตรวจสอบก่อนยืนยัน' : ''}
        </div>
      )}

      <div className="grid shrink-0 grid-cols-1 items-stretch gap-3 xl:grid-cols-[3fr_2fr]">
        <div
          className={`h-full ${checkoutLocked ? 'pointer-events-none opacity-60' : ''}`}
          aria-disabled={checkoutLocked}
        >
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

        <div className="h-full">
          <SaleWorkspacePanel
            title={sourceLocked ? 'สินค้าจากใบจอง' : 'ค้นหาสินค้า'}
            locked={cartLocked}
            className="h-full"
            action={
              <SalePriceTypeSelector
                value={sale.presentation.selectedPriceType}
                onChange={sale.presentation.setSelectedPriceType}
                disabled={cartLocked}
              />
            }
          >
            {!sourceLocked && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="ค้นหาด้วยบาร์โค้ด, SN, ชื่อ หรือรุ่นสินค้า"
                  onKeyDown={sale.itemSearch.handleBarcodeSearch}
                  disabled={checkoutLocked}
                  data-testid="pos-sale-barcode-input"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>
            )}
          </SaleWorkspacePanel>
        </div>
      </div>

      <div className="min-h-[240px] xl:min-h-0 xl:flex-1 xl:overflow-hidden">
        <SaleWorkspacePanel locked={cartLocked} className="h-full min-h-[240px] xl:min-h-0 xl:overflow-hidden">
          <div className="h-full overflow-auto rounded-xl border border-slate-200 overscroll-contain">
            <SaleItemTable
              items={sale.cart.items}
              onRemove={sourceLocked ? () => {} : sale.cart.remove}
              onUpdate={sourceLocked ? () => {} : sale.cart.update}
              onChangeSimpleQuantity={sourceLocked ? () => {} : sale.cart.setSimpleQuantity}
              billDiscount={sale.presentation.billDiscount}
            />
          </div>
        </SaleWorkspacePanel>
      </div>

      <div className="shrink-0">
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
          includeDeliveryNote={sale.documentHandoff.includeDeliveryNote}
          onIncludeDeliveryNoteChange={sale.documentHandoff.setIncludeDeliveryNote}
          onConfirmSale={sale.completion.confirm}
          onSaveHeldCart={sale.heldCart.commands.openPanel}
          heldCartDisabled={sourceLocked}
          saleExecutionDisabled={saleExecutionDisabled}
        />
      </div>

      {!checkoutLocked && !sourceLocked && (
        <PosHeldCartPanel
          open={sale.heldCart.panel.open}
          onClose={sale.heldCart.commands.closePanel}
          currentItems={sale.cart.items}
          currentCustomerId={sale.customer.customerId}
          currentPriceType={sale.presentation.selectedPriceType}
          onLoad={sale.heldCart.commands.load}
          onSavedAndClear={heldCartSavedAndClear}
        />
      )}

      {!sourceLocked && (
        <SaleItemSearchDialog
          open={sale.itemSearch.selection.open}
          query={sale.itemSearch.selection.query}
          items={sale.itemSearch.selection.items}
          truncated={sale.itemSearch.selection.truncated}
          priceType={sale.presentation.selectedPriceType}
          onSelect={sale.itemSearch.selectSearchItem}
          onClose={sale.itemSearch.closeSelection}
        />
      )}

      <CoreSalesHelpDrawer open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

export default QuickSalePage;
