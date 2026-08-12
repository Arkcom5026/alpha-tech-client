import React from 'react';

import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import { useSalePaymentWorkflow } from '../payment';
import PaymentSummary from './PaymentSummary';
import PaymentMethodInput from './PaymentMethodInput';
import CalculationDetails from './CalculationDetails';

const fmt = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PaymentPanel = ({ children }) => (
  <section className="flex min-h-full flex-col rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex flex-1 flex-col">{children}</div>
  </section>
);

const PaymentStatus = ({ calculation, isCreditSale }) => {
  const receivedAmount = Number((calculation.grandTotalPaid + calculation.changeAmount).toFixed(2));
  const outstandingAmount = Math.max(
    0,
    Number((calculation.totalToPay - calculation.grandTotalPaid).toFixed(2))
  );

  if (isCreditSale) {
    return (
      <div className="mb-3 grid grid-cols-2 gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <div>
          <p className="text-xs font-medium text-amber-700">ยอดใช้มัดจำ</p>
          <p className="mt-0.5 font-mono font-semibold">฿{fmt(calculation.grandTotalPaid)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-amber-700">ยอดค้างชำระ</p>
          <p className="mt-0.5 font-mono font-semibold">฿{fmt(outstandingAmount)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
      <div className="flex items-center justify-between gap-4 border-b border-teal-100 pb-2">
        <span className="text-sm font-semibold text-teal-900">ยอดสุทธิที่ต้องชำระ</span>
        <span data-testid="pos-sale-total-due" className="font-mono text-lg font-bold text-teal-900">
          ฿{fmt(calculation.totalToPay)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-medium text-slate-500">ยอดเงินที่รับ</p>
          <p className={`mt-0.5 font-mono font-semibold ${receivedAmount >= calculation.totalToPay ? 'text-emerald-700' : 'text-rose-700'}`}>
            ฿{fmt(receivedAmount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">เงินทอน</p>
          <p className="mt-0.5 font-mono font-semibold text-emerald-700">฿{fmt(calculation.changeAmount)}</p>
        </div>
      </div>
    </div>
  );
};

const PaymentSection = ({
  saleItems,
  isSubmitting,
  recovery,
  onSaleConfirmed,
  setClearPhoneTrigger,
  currentSaleMode,
  onSaleModeChange,
  saleOption,
  onSaleOptionChange,
  includeDeliveryNote,
  onIncludeDeliveryNoteChange,
  onConfirmSale,
  onSaveHeldCart,
  heldCartDisabled = false,
  saleExecutionDisabled = false,
}) => {
  const {
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
    paymentList,
    cardRef,
    setCardRef,
    resetSaleOrderAction,
  } = useSalesStore();

  const {
    customerDepositAmount,
    selectedCustomer,
    selectedDeposit,
    depositUsed,
    setDepositUsed,
    clearCustomerAndDeposit,
    setCustomerIdAction,
  } = useCustomerDepositStore();

  const payment = useSalePaymentWorkflow({
    saleItems,
    isSubmitting,
    recovery,
    currentSaleMode,
    onSaleModeChange,
    saleOption,
    onSaleOptionChange,
    includeDeliveryNote,
    onIncludeDeliveryNoteChange,
    onConfirmSale,
    onSaleConfirmed,
    setClearPhoneTrigger,
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
    paymentList,
    cardRef,
    setCardRef,
    resetSaleOrderAction,
    customerDepositAmount,
    selectedCustomer,
    selectedDeposit,
    depositUsed,
    setDepositUsed,
    clearCustomerAndDeposit,
    setCustomerIdAction,
  });

  const calculation = payment.calculation;
  const hasValidCustomerId = Boolean(selectedCustomer?.id);
  const isCreditSale = currentSaleMode === 'CREDIT';

  return (
    <div className="w-full rounded-2xl bg-slate-50 p-3 md:p-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <PaymentPanel>
          <CalculationDetails
            totalOriginalPrice={calculation.totalOriginalPrice}
            totalDiscountOnly={calculation.totalDiscountOnly}
            billDiscount={billDiscount}
            setBillDiscount={payment.discount.changeBillDiscount}
            totalDiscount={calculation.totalDiscount}
            priceBeforeVat={calculation.priceBeforeVat}
            vatAmount={calculation.vatAmount}
            customerDepositAmount={customerDepositAmount}
            depositUsed={depositUsed}
            handleDepositUsedChange={payment.deposit.changeUsed}
          />
        </PaymentPanel>

        <PaymentPanel>
          <PaymentStatus calculation={calculation} isCreditSale={isCreditSale} />
          {!isCreditSale ? (
            <PaymentMethodInput
              cash={paymentList.find((item) => item.method === 'CASH')?.amount || ''}
              transfer={paymentList.find((item) => item.method === 'TRANSFER')?.amount || ''}
              credit={paymentList.find((item) => item.method === 'CARD')?.amount || ''}
              onCashChange={(event) => setPaymentAmount('CASH', String(event?.target?.value ?? '').replace(/,/g, ''))}
              onTransferChange={(event) => setPaymentAmount('TRANSFER', String(event?.target?.value ?? '').replace(/,/g, ''))}
              onCreditChange={(event) => setPaymentAmount('CARD', String(event?.target?.value ?? '').replace(/,/g, ''))}
              cardRef={cardRef}
              onCardRefChange={(event) => setCardRef(event.target.value)}
            />
          ) : (
            <div className="flex min-h-32 flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
              <div>
                <p className="font-semibold text-amber-900">ขายแบบเครดิต</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">ระบบปิดช่องรับเงินสด เงินโอน และบัตรในรายการนี้</p>
              </div>
            </div>
          )}
        </PaymentPanel>

        <PaymentPanel>
          <PaymentSummary
            isConfirmEnabled={payment.confirmation.enabled && !saleExecutionDisabled}
            isSubmitting={isSubmitting}
            onConfirm={payment.confirmation.confirm}
            paymentError={payment.feedback.error}
            recovery={payment.feedback.recovery}
            retryingExistingCommand={payment.confirmation.retryingExistingCommand}
            saleOption={saleOption}
            setSaleOption={onSaleOptionChange}
            includeDeliveryNote={includeDeliveryNote}
            setIncludeDeliveryNote={onIncludeDeliveryNoteChange}
            currentSaleMode={currentSaleMode}
            setCurrentSaleMode={payment.saleMode.change}
            hasValidCustomerId={hasValidCustomerId}
            onSaveHeldCart={onSaveHeldCart}
            heldCartDisabled={heldCartDisabled}
            saleExecutionDisabled={saleExecutionDisabled}
          />
        </PaymentPanel>
      </div>
    </div>
  );
};

export default PaymentSection;
