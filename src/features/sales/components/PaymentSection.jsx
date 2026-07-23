// src/features/sales/components/PaymentSection.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import PaymentSummary from './PaymentSummary';
import PaymentMethodInput from './PaymentMethodInput';
import CalculationDetails from './CalculationDetails';

const PaymentSection = ({
  saleItems,
  isSubmitting,
  setIsSubmitting,
  onSaleConfirmed,
  setClearPhoneTrigger,
  currentSaleMode,
  onSaleModeChange,
  saleOption,
  onSaleOptionChange,
  onConfirmSale,
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

  const [paymentError, setPaymentError] = useState('');
  const [depositTouched, setDepositTouched] = useState(false);
  const confirmLockRef = useRef(false);

  const effectiveCustomer = selectedCustomer || { id: null, name: 'ลูกค้าทั่วไป' };
  const hasValidCustomerId = !!effectiveCustomer?.id;
  const customerType = effectiveCustomer?.type;
  const isCreditSale = currentSaleMode === 'CREDIT';

  const hasImmediatePayment = useMemo(() => {
    return (paymentList || []).some((p) => {
      const m = String(p?.method || '').toUpperCase();
      if (m === 'DEPOSIT') return false;
      return parseMoney(p?.amount) > 0;
    });
  }, [paymentList]);

  const validSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const round2 = (n) => Number((Number(n) || 0).toFixed(2));

  function parseMoney(val) {
    if (val == null) return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '').trim();
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }

  const getItemPrice = (item) => parseMoney(item?.price ?? item?.sellPrice ?? item?.unitPrice ?? 0);
  const getItemDiscount = (item) => parseMoney(item?.discountWithoutBill ?? item?.discount ?? 0);

  const totalOriginalPrice = round2(validSaleItems.reduce((sum, item) => sum + getItemPrice(item), 0));
  const totalDiscountOnly = round2(validSaleItems.reduce((sum, item) => sum + getItemDiscount(item), 0));
  const safeBillDiscount = parseMoney(billDiscount);
  const totalDiscount = round2(totalDiscountOnly + safeBillDiscount);
  const safeFinalPrice = round2(Math.max(totalOriginalPrice - totalDiscountOnly - safeBillDiscount, 0));

  useEffect(() => {
    if (depositTouched) return;
    const suggested = Math.min(customerDepositAmount, safeFinalPrice);
    setDepositUsed(suggested);
  }, [customerDepositAmount, safeFinalPrice, setDepositUsed, depositTouched]);

  useEffect(() => {
    if (!isCreditSale) return;
    try {
      setPaymentAmount?.('CASH', '');
      setPaymentAmount?.('TRANSFER', '');
      setPaymentAmount?.('CARD', '');
      setCardRef?.('');
    } catch (_) {}
  }, [isCreditSale, setPaymentAmount, setCardRef]);

  const handleDepositUsedChange = useCallback(
    (input) => {
      const raw = typeof input === 'number' ? input : input?.target?.value;
      const amount = parseMoney(raw);
      setDepositTouched(true);
      setDepositUsed(Math.min(amount, customerDepositAmount));
    },
    [customerDepositAmount, setDepositUsed]
  );

  const vatRate = 7;
  const vatAmount = safeFinalPrice > 0 ? round2((safeFinalPrice * vatRate) / (100 + vatRate)) : 0;
  const priceBeforeVat = safeFinalPrice > 0 ? round2(safeFinalPrice - vatAmount) : 0;
  const safeDepositUsed = Math.min(depositUsed, safeFinalPrice);

  const calc = useMemo(() => {
    const cashAmount = parseMoney(paymentList.find((p) => p.method === 'CASH')?.amount || 0);
    const totalPaid = (paymentList || []).reduce((sum, p) => sum + parseMoney(p.amount), 0);
    const paidByOther = totalPaid - cashAmount;
    const remainingToPay = Math.max(safeFinalPrice - paidByOther - safeDepositUsed, 0);
    const safeChangeAmount = Math.max(cashAmount - remainingToPay, 0);
    const totalPaidNet = totalPaid - safeChangeAmount;
    const grandTotalPaid = totalPaidNet + safeDepositUsed;

    return {
      cashAmount,
      totalPaid,
      paidByOther,
      remainingToPay,
      safeChangeAmount,
      totalPaidNet,
      grandTotalPaid,
      totalToPay: safeFinalPrice,
    };
  }, [paymentList, safeFinalPrice, safeDepositUsed]);

  const handleSetCurrentSaleMode = useCallback(
    (nextMode) => {
      const outstanding = Math.max(0, (parseMoney(calc?.totalToPay) || 0) - (parseMoney(calc?.grandTotalPaid) || 0));
      if (nextMode === 'CREDIT' && outstanding > 0 && !hasValidCustomerId) {
        setPaymentError('การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน (มียอดค้างชำระ)');
        return;
      }
      onSaleModeChange?.(nextMode);
    },
    [calc?.grandTotalPaid, calc?.totalToPay, hasValidCustomerId, onSaleModeChange]
  );

  const isConfirmEnabled =
    (currentSaleMode === 'CASH' &&
      calc.totalPaid + safeDepositUsed >= calc.totalToPay &&
      safeDepositUsed <= safeFinalPrice &&
      validSaleItems.length > 0) ||
    (currentSaleMode === 'CREDIT' &&
      validSaleItems.length > 0 &&
      hasValidCustomerId &&
      !hasImmediatePayment);

  const handleConfirm = useCallback(async (confirmContext = {}) => {
    let result = null;
    if (confirmLockRef.current) return null;
    confirmLockRef.current = true;
    setPaymentError('');

    try {
      if (validSaleItems.length === 0) {
        setPaymentError('กรุณาเพิ่มรายการสินค้าก่อนยืนยันการขาย');
        return null;
      }
      if (isSubmitting) {
        setPaymentError('กำลังดำเนินการ กรุณารอสักครู่');
        return null;
      }
      if (currentSaleMode === 'CASH' && calc.totalPaid + safeDepositUsed < calc.totalToPay) {
        setPaymentError('ยอดเงินที่ชำระยังไม่เพียงพอ');
        return null;
      }
      if (safeBillDiscount > totalOriginalPrice) {
        setPaymentError('ส่วนลดท้ายบิลห้ามเกินยอดรวมราคาสินค้า');
        return null;
      }
      if (currentSaleMode === 'CREDIT' && !hasValidCustomerId) {
        setPaymentError('การขายแบบเครดิตต้องเลือกชื่อลูกค้าก่อน');
        return null;
      }
      if (currentSaleMode === 'CREDIT' && hasImmediatePayment) {
        setPaymentError('โหมดเครดิต: ห้ามกรอกเงินสด/โอน/บัตรทันที (อนุญาตเฉพาะ “มัดจำ”)');
        return null;
      }

      const paymentsSnapshot = (paymentList || []).map((p) => {
        let method = String(p?.method || '').toUpperCase();
        const amount = parseMoney(p?.amount);

        // 🟢 FIXED: สลับแมปคีย์ 'CARD' หน้าบ้านให้แปลงเป็น 'CREDIT' ส่งเข้าฐานข้อมูลหลังบ้านตรงล็อก
        if (method === 'CARD') method = 'CREDIT'; 

        if (method === 'CASH') {
          const appliedCash = Math.max(amount - parseMoney(calc?.safeChangeAmount), 0);
          return { ...p, method, amount: appliedCash };
        }
        return { ...p, method, amount };
      });

      let didSucceed = false;

      try {
        setIsSubmitting?.(true);
        if (typeof onConfirmSale !== 'function') {
          setPaymentError('ระบบยืนยันการขายยังไม่พร้อมใช้งาน (missing onConfirmSale)');
          return null;
        }

        const updatedPayments = [...paymentsSnapshot];
        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({
            method: 'DEPOSIT',
            amount: safeDepositUsed,
            customerDepositId: selectedDeposit.id,
            note: 'customer deposit',
          });
        }
        const finalValidPayments = updatedPayments.filter((p) => parseMoney(p.amount) > 0);
        if (currentSaleMode === 'CASH' && finalValidPayments.length === 0) {
          setPaymentError('Payment evidence is required');
          return null;
        }

        const res = await onConfirmSale({
          deliveryNoteMode: isCreditSale ? 'PRINT' : undefined,
          saleType: customerType === 'GOVERNMENT' ? 'GOVERNMENT' : undefined,
          paymentIntent: {
            receivedAt: new Date().toISOString(),
            paymentItems: finalValidPayments.map((payment) => ({
              paymentMethod: payment.method,
              amount: payment.amount,
              note: payment.note || null,
              cardRef: payment.cardRef || (payment.method === 'CREDIT' ? cardRef : null),
              customerDepositId: payment.customerDepositId || null,
            })),
          },
        });

        if (res?.error) {
          setPaymentError(`${res.code ? `[${res.code}] ` : ''}${res.error}`);
          confirmContext?.printWindow?.close?.();
          return null;
        }

        const saleId = res?.saleId;
        if (!saleId) {
          setPaymentError('❌ ไม่พบ ID ของรายการขายหลังจากยืนยัน');
          return null;
        }

        /*
        const updatedPaymentsLegacy = [...paymentsSnapshot];
        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({
            method: 'DEPOSIT',
            amount: safeDepositUsed,
            customerDepositId: selectedDeposit.id,
            note: 'ใช้มัดจำ',
          });
        }

        // กรองเอาเฉพาะท่อนที่มีจำนวนเงินจริงส่งเข้าตารางชำระเงินหลายช่องทาง
        const finalValidPayments = updatedPayments.filter((p) => parseMoney(p.amount) > 0);

        if (currentSaleMode === 'CASH' && finalValidPayments.length === 0) {
          setPaymentError('⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินมากกว่า 0 หรือใช้มัดจำ');
          return null;
        }

        await submitMultiPaymentAction({
          saleId: Number(saleId),
          paymentList: finalValidPayments,
        });
        */

        const computedSaleOption = isCreditSale
          ? 'DELIVERY_NOTE'
          : saleOption === 'NONE'
            ? 'RECEIPT'
            : saleOption;

        if (typeof onSaleConfirmed === 'function') {
          onSaleConfirmed(saleId, computedSaleOption, confirmContext);
        }

        result = { saleId, saleOption: computedSaleOption };
        didSucceed = true;
        return result;
      } catch (err) {
        confirmContext?.printWindow?.close?.();
        setPaymentError('❌ ยืนยันการขายล้มเหลว: ' + (err?.message || 'เกิดข้อผิดพลาด'));
        return null;
      } finally {
        setIsSubmitting?.(false);
        if (didSucceed) {
          setTimeout(() => {
            const phoneInput = document.getElementById('customer-phone-input');
            if (phoneInput) { phoneInput.focus(); phoneInput.select?.(); }
          }, 100);

          setDepositTouched(false);
          setDepositUsed(0);
          setCardRef('');
          setBillDiscount(0);
          resetSaleOrderAction?.();
          clearCustomerAndDeposit?.();
          setCustomerIdAction?.(null);
          setClearPhoneTrigger?.(Date.now());
          onSaleModeChange?.('CASH');
          onSaleOptionChange?.('NONE');
        }
      }
    } finally {
      confirmLockRef.current = false;
    }
  }, [
    calc.totalPaid,
    calc.totalToPay,
    clearCustomerAndDeposit,
    currentSaleMode,
    hasValidCustomerId,
    isSubmitting,
    onConfirmSale,
    onSaleConfirmed,
    onSaleModeChange,
    onSaleOptionChange,
    paymentList,
    resetSaleOrderAction,
    safeBillDiscount,
    safeDepositUsed,
    safeFinalPrice,
    saleOption,
    selectedDeposit?.id,
    setBillDiscount,
    setCardRef,
    setClearPhoneTrigger,
    setCustomerIdAction,
    setDepositUsed,
    setIsSubmitting,
    totalOriginalPrice,
    validSaleItems.length,
    isCreditSale,
    customerType,
    calc?.safeChangeAmount,
    hasImmediatePayment,
  ]);

  const handleBillDiscountChange = useCallback(
    (input) => {
      const raw = typeof input === 'number' ? input : input?.target?.value;
      const newDiscount = parseMoney(raw);
      if (newDiscount >= 0 && newDiscount <= totalOriginalPrice) {
        setBillDiscount(newDiscount);
      } else if (newDiscount < 0) {
        setBillDiscount(0);
      }
    },
    [setBillDiscount, totalOriginalPrice]
  );

  return (
    <div className="w-full p-2 bg-slate-50/20 rounded-xl select-none animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch justify-center">
        <div className="lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 w-full flex shadow-sm">
            <CalculationDetails
              totalOriginalPrice={totalOriginalPrice}
              totalDiscountOnly={totalDiscountOnly}
              billDiscount={billDiscount}
              setBillDiscount={handleBillDiscountChange}
              totalDiscount={totalDiscount}
              priceBeforeVat={priceBeforeVat}
              vatAmount={vatAmount}
              customerDepositAmount={customerDepositAmount}
              depositUsed={depositUsed}
              handleDepositUsedChange={handleDepositUsedChange}
            />
          </div>
        </div>

        <div className="lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 w-full flex flex-col justify-center shadow-sm">
            {!isCreditSale ? (
              <PaymentMethodInput
                cash={paymentList.find((p) => p.method === 'CASH')?.amount || ''}
                transfer={paymentList.find((p) => p.method === 'TRANSFER')?.amount || ''}
                credit={paymentList.find((p) => p.method === 'CARD')?.amount || ''}
                onCashChange={(e) => setPaymentAmount('CASH', String(e?.target?.value ?? '').replace(/,/g, ''))}
                onTransferChange={(e) => setPaymentAmount('TRANSFER', String(e?.target?.value ?? '').replace(/,/g, ''))}
                onCreditChange={(e) => setPaymentAmount('CARD', String(e?.target?.value ?? '').replace(/,/g, ''))}
                cardRef={cardRef}
                onCardRefChange={(e) => setCardRef(e.target.value)}
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
              totalToPay={calc.totalToPay}
              grandTotalPaid={calc.grandTotalPaid}
              safeChangeAmount={calc.safeChangeAmount}
              isConfirmEnabled={isConfirmEnabled}
              isSubmitting={isSubmitting}
              onConfirm={handleConfirm}
              paymentError={paymentError}
              saleOption={saleOption}
              setSaleOption={onSaleOptionChange}
              currentSaleMode={currentSaleMode}
              setCurrentSaleMode={handleSetCurrentSaleMode}
              hasValidCustomerId={hasValidCustomerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;
