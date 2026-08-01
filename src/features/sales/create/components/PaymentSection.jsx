import React from 'react';

import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import { useSalePaymentWorkflow } from '../payment';
import PaymentSummary from './PaymentSummary';
import PaymentMethodInput from './PaymentMethodInput';
import CalculationDetails from './CalculationDetails';

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
  onConfirmSale,
  onSaveHeldCart,
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
    <div className="w-full p-2 bg-slate-50/20 rounded-xl select-none animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch justify-center">
        <div className="lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 w-full flex shadow-sm">
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
          </div>
        </div>

        <div className="lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 w-full flex flex-col justify-center shadow-sm">
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
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-full h-full flex flex-col justify-center space-y-1 text-slate-400">
                <div className="text-xs font-black text-slate-800">การรับเงิน (โหมดเครดิตหนี้)</div>
                <div className="text-[11px] font-bold">🚫 ระบบปิดล็อกอินพุตรับเงินสด/เงินโอน/รูดบัตรเครดิตทันที</div>
                <div className="text-[10px] font-medium text-slate-500 pt-2 border-t border-slate-200/60 mt-2">
                  * อนุญาตให้ตัดสิทธิ์หักลบได้เฉพาะยอดเงินมัดจำล่วงหน้า (ถ้ามี) ผ่านช่องมัดจำในแผงซ้ายเท่านั้นครับ
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 w-full flex shadow-sm">
            <PaymentSummary
              totalToPay={calculation.totalToPay}
              grandTotalPaid={calculation.grandTotalPaid}
              safeChangeAmount={calculation.changeAmount}
              isConfirmEnabled={payment.confirmation.enabled}
              isSubmitting={isSubmitting}
              onConfirm={payment.confirmation.confirm}
              paymentError={payment.feedback.error}
              recovery={payment.feedback.recovery}
              retryingExistingCommand={payment.confirmation.retryingExistingCommand}
              saleOption={saleOption}
              setSaleOption={onSaleOptionChange}
              currentSaleMode={currentSaleMode}
              setCurrentSaleMode={payment.saleMode.change}
              hasValidCustomerId={hasValidCustomerId}
              onSaveHeldCart={onSaveHeldCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
