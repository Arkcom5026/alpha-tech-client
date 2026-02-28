// ============================================================
// 📁 FILE: src/features/sales/components/PaymentSection.jsx
// ✅ Final patched version: fix JSX syntax + computedSaleOption scope + store wiring + robust number parsing
// ============================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import usePaymentStore from '@/features/payment/store/paymentStore';

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

  const { submitMultiPaymentAction } = usePaymentStore();

  // ✅ FIX: setCustomerIdAction ต้องมาจาก customerDepositStore
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

  // 🔒 กันกด Confirm ซ้ำ/Enter ซ้ำ ระหว่าง async (double-submit guard)
  const confirmLockRef = useRef(false);

  const effectiveCustomer = selectedCustomer || { id: null, name: 'ลูกค้าทั่วไป' };
  const hasValidCustomerId = !!effectiveCustomer?.id;

  // ✅ หน่วยงาน/องค์กร: อิงจาก customer.type (INDIVIDUAL/ORGANIZATION/GOVERNMENT)
  const customerType = effectiveCustomer?.type;
  const isOrgBuyer = customerType === 'ORGANIZATION' || customerType === 'GOVERNMENT';
  const isCreditSale = currentSaleMode === 'CREDIT';
  const isCreditOrg = currentSaleMode === 'CREDIT' && isOrgBuyer; // (kept for future use)

  const validSaleItems = Array.isArray(saleItems) ? saleItems : [];

  // ✅ Minimal hardening: รองรับเลขที่เป็น string มี comma (เช่น "1,200")
  const parseMoney = (val) => {
    if (val == null) return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '').trim();
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  const getItemPrice = (item) => {
    const p =
      item?.price ??
      item?.sellPrice ??
      item?.unitPrice ??
      item?.prices?.retail ??
      item?.prices?.wholesale ??
      0;
    return parseMoney(p);
  };

  const getItemDiscount = (item) => {
    const d = item?.discountWithoutBill ?? item?.discount ?? 0;
    return parseMoney(d);
  };

  const totalOriginalPrice = validSaleItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  const totalDiscountOnly = validSaleItems.reduce((sum, item) => sum + getItemDiscount(item), 0);

  const safeBillDiscount = parseMoney(billDiscount);
  const totalDiscount = totalDiscountOnly + safeBillDiscount;
  const safeFinalPrice = Math.max(totalOriginalPrice - totalDiscountOnly - safeBillDiscount, 0);

  useEffect(() => {
    // ✅ Guard: อย่า overwrite ค่า “มัดจำที่ใช้” หลังผู้ใช้เริ่มแก้เอง
    if (depositTouched) return;
    const suggested = Math.min(customerDepositAmount, safeFinalPrice);
    setDepositUsed(suggested);
  }, [customerDepositAmount, safeFinalPrice, setDepositUsed, depositTouched]);

  const handleDepositUsedChange = useCallback(
    (input) => {
      // ✅ Robust: รองรับทั้ง onChange(event) และ onChange(number)
      const raw = typeof input === 'number' ? input : input?.target?.value;
      const amount = parseMoney(raw);
      const safeAmount = Math.min(amount, customerDepositAmount);
      setDepositTouched(true);
      setDepositUsed(safeAmount);
    },
    [customerDepositAmount, setDepositUsed]
  );

  const priceBeforeVat = safeFinalPrice > 0 ? safeFinalPrice / 1.07 : 0;
  const vatAmount = safeFinalPrice > 0 ? safeFinalPrice - priceBeforeVat : 0;
  const safeDepositUsed = Math.min(depositUsed, safeFinalPrice);

  const calc = useMemo(() => {
    const cashAmount = parseMoney(paymentList.find((p) => p.method === 'CASH')?.amount || 0);

    const totalPaid = (paymentList || []).reduce((sum, p) => {
      const amount = parseMoney(p.amount);
      return sum + amount;
    }, 0);

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
      const outstanding = Math.max(
        0,
        (parseMoney(calc?.totalToPay) || 0) - (parseMoney(calc?.grandTotalPaid) || 0)
      );

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
    (currentSaleMode === 'CREDIT' && validSaleItems.length > 0);

  const handleConfirm = useCallback(async () => {
    let result = null;

    // 🔒 ป้องกันการยิงซ้ำจาก double click / enter key
    if (confirmLockRef.current) return null;
    confirmLockRef.current = true;

    setPaymentError('');

    // ✅ IMPORTANT: ต้องปล่อย lock เสมอ แม้จะ return ออกก่อนเข้า try/catch หลัก
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

      const paymentsSnapshot = (paymentList || []).map((p) => ({ ...p }));

      let didSucceed = false;

      try {
        setIsSubmitting?.(true);

        if (typeof onConfirmSale !== 'function') {
          setPaymentError('ระบบยืนยันการขายยังไม่พร้อมใช้งาน (missing onConfirmSale)');
          return null;
        }

        const res = await onConfirmSale({
          // ✅ CREDIT → DELIVERY_NOTE เสมอ (บังคับพิมพ์)
          deliveryNoteMode: isCreditSale ? 'PRINT' : undefined,
          saleType: customerType === 'GOVERNMENT' ? 'GOVERNMENT' : undefined,
        });

        if (res?.error) {
          setPaymentError(res.error);
          return null;
        }

        const saleId = res?.saleId;
        if (!saleId) {
          setPaymentError('❌ ไม่พบ ID ของรายการขายหลังจากยืนยัน');
          return null;
        }

        const updatedPayments = [...paymentsSnapshot];

        if (currentSaleMode === 'CASH') {
          const validPayments = updatedPayments.filter((p) => parseMoney(p.amount) > 0);
          if (validPayments.length === 0 && safeDepositUsed === 0) {
            setPaymentError('⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินมากกว่า 0 หรือใช้มัดจำ');
            return null;
          }
        }

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({
            method: 'DEPOSIT',
            amount: safeDepositUsed,
            customerDepositId: selectedDeposit.id,
            note: 'ใช้มัดจำ',
          });
        }

        await submitMultiPaymentAction({
          saleId,
          paymentList: updatedPayments,
        });

        // ✅ CREDIT → DELIVERY_NOTE เสมอ
        const computedSaleOption = isCreditSale ? 'DELIVERY_NOTE' : saleOption;

        if (typeof onSaleConfirmed === 'function') {
          onSaleConfirmed(saleId, computedSaleOption);
        }

        // ✅ Return for PaymentSummary (so it can navigate/print)
        result = { saleId, saleOption: computedSaleOption };

        didSucceed = true;
        return result;
      } catch (err) {
        setPaymentError('❌ ยืนยันการขายล้มเหลว: ' + (err?.message || 'เกิดข้อผิดพลาด'));
        return null;
      } finally {
        // ✅ Always: release submitting state
        setIsSubmitting?.(false);

        // ✅ Only reset sale state AFTER success.
        //    If confirm/payment fails, keep cart/payment inputs so user can fix and retry.
        if (didSucceed) {
          setTimeout(() => {
            const phoneInput = document.getElementById('customer-phone-input');
            if (phoneInput) {
              phoneInput.focus();
              phoneInput.select?.();
            }
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
      // ✅ Always release confirm lock (even when early-return)
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
    submitMultiPaymentAction,
    totalOriginalPrice,
    validSaleItems.length,
    isCreditSale,
    isCreditOrg,
    isOrgBuyer,
    customerType,
  ]);

  const handleBillDiscountChange = useCallback(
    (input) => {
      // ✅ Robust: รองรับทั้ง onChange(event) และ onChange(number)
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
    <div className="font-bold min-w-[1530px]">
      <div className="bg-white flex justify-center gap-4 py-4">
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

        <PaymentMethodInput
          cash={paymentList.find((p) => p.method === 'CASH')?.amount || ''}
          transfer={paymentList.find((p) => p.method === 'TRANSFER')?.amount || ''}
          credit={paymentList.find((p) => p.method === 'CREDIT')?.amount || ''}
          onCashChange={(e) => {
            const cleaned = String(e?.target?.value ?? '').replace(/,/g, '');
            setPaymentAmount('CASH', cleaned);
          }}
          onTransferChange={(e) => {
            const cleaned = String(e?.target?.value ?? '').replace(/,/g, '');
            setPaymentAmount('TRANSFER', cleaned);
          }}
          onCreditChange={(e) => {
            const cleaned = String(e?.target?.value ?? '').replace(/,/g, '');
            setPaymentAmount('CREDIT', cleaned);
          }}
          cardRef={cardRef}
          onCardRefChange={(e) => setCardRef(e.target.value)}
        />

        {/* ✅ CREDIT: พิมพ์ใบส่งของ (บังคับ) */}
        {isCreditSale && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 min-w-[340px]">
            <div className="text-sm font-bold mb-2">เอกสาร (เครดิต)</div>
            <div className="text-sm">✅ พิมพ์ใบส่งของ (บังคับ)</div>
            <div className="text-xs text-gray-600 mt-2">
              * ขายแบบเครดิตยังไม่ออกใบกำกับภาษี (ออกได้เมื่อรับเงิน)
            </div>
          </div>
        )}

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
  );
};

export default PaymentSection;