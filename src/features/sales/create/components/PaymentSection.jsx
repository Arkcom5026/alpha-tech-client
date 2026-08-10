import React from 'react';

import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import { useSalePaymentWorkflow } from '../payment';
import PaymentSummary from './PaymentSummary';
import PaymentMethodInput from './PaymentMethodInput';
import CalculationDetails from './CalculationDetails';

const PaymentPanel = ({ title, description, children }) => (
  <section className="flex min-h-full flex-col rounded-2xl border border-slate-200 bg-white p-4">
    <div className="mb-4 border-b border-slate-100 pb-3">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
    <div className="flex flex-1 flex-col">{children}</div>
  </section>
);

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
        <PaymentPanel title="สรุปยอดขาย" description="ตรวจสอบส่วนลด ภาษี และยอดที่ต้องชำระ">
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

        <PaymentPanel title="รับชำระเงิน" description={isCreditSale ? 'รายการเครดิตไม่รับเงินในขั้นตอนนี้' : 'ระบุยอดตามวิธีที่ลูกค้าชำระ'}>
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
            <div className="flex min-h-40 flex-1 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
              <div>
                <p className="font-semibold text-amber-900">ขายแบบเครดิต</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">ระบบปิดช่องรับเงินสด เงินโอน และบัตรในรายการนี้</p>
              </div>
            </div>
          )}
        </PaymentPanel>

        <PaymentPanel title="ยืนยันรายการ" description="เลือกเอกสารและตรวจสอบสถานะก่อนบันทึก">
          <PaymentSummary
            totalToPay={calculation.totalToPay}
            grandTotalPaid={calculation.grandTotalPaid}
            safeChangeAmount={calculation.changeAmount}
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
