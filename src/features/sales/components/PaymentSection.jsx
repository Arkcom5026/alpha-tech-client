// src/features/sales/components/PaymentSection.jsx
// 🏛️ Premium Next-Gen POS Financial Terminal: (Syntax Restored & Responsive Grid Layout)

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
  const hasImmediatePayment = useMemo(() => {
    // ✅ Any non-deposit payment amount typed in the UI (CASH/TRANSFER/CARD) should be blocked in CREDIT mode
    return (paymentList || []).some((p) => {
      const m = String(p?.method || '').toUpperCase();
      if (m === 'DEPOSIT') return false;
      return parseMoney(p?.amount) > 0;
    });
  }, [paymentList]);
  const isCreditOrg = currentSaleMode === 'CREDIT' && isOrgBuyer; // (kept for future use)

  const validSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const round2 = (n) => Number((Number(n) || 0).toFixed(2));

  // ✅ Minimal hardening: รองรับเลขที่เป็น string มี comma (เช่น "1,200")
  function parseMoney(val) {
    if (val == null) return 0;
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '').trim();
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  }

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
    // ✅ Item-level discount semantics (VAT included pricing)
    // - ค่าบวก  = ลดราคา
    // - ค่าลบ   = บวกเพิ่มราคา (manual markup)
    const d = item?.discountWithoutBill ?? item?.discount ?? 0;
    return parseMoney(d);
  };

  const totalOriginalPrice = round2(
    validSaleItems.reduce((sum, item) => sum + getItemPrice(item), 0)
  );
  const totalDiscountOnly = round2(
    validSaleItems.reduce((sum, item) => sum + getItemDiscount(item), 0)
  );

  const safeBillDiscount = parseMoney(billDiscount);
  const totalDiscount = round2(totalDiscountOnly + safeBillDiscount);

  // ✅ VAT-included pricing baseline
  // safeFinalPrice = totalOriginalPrice - itemDiscounts - billDiscount
  // ดังนั้นถ้ามี item discount ติดลบ เช่น -10 จะกลายเป็น “บวกเพิ่มราคา” 10 บาทโดยอัตโนมัติ
  const safeFinalPrice = round2(Math.max(totalOriginalPrice - totalDiscountOnly - safeBillDiscount, 0));

  useEffect(() => {
    // ✅ Guard: อย่า overwrite ค่า “มัดจำที่ใช้” หลังผู้ใช้เริ่มแก้เอง
    if (depositTouched) return;
    const suggested = Math.min(customerDepositAmount, safeFinalPrice);
    setDepositUsed(suggested);
  }, [customerDepositAmount, safeFinalPrice, setDepositUsed, depositTouched]);

  // ✅ CREDIT mode policy (production): ห้ามรับเงินทันที ยกเว้น “มัดจำ”
  // - Clear any typed payment amounts when switching to CREDIT (avoid accidental partial payment)
  useEffect(() => {
    if (!isCreditSale) return;

    try {
      setPaymentAmount?.('CASH', '');
      setPaymentAmount?.('TRANSFER', '');
      setPaymentAmount?.('CARD', '');
      setCardRef?.('');
    } catch (_) {
      // ignore
    }
  }, [isCreditSale, setPaymentAmount, setCardRef]);

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

  // ✅ VAT-included model (ราคาหน้างาน = รวม VAT แล้ว)
  // VAT คำนวณเพื่อ "แยกแสดง" เท่านั้น ไม่ได้บวกเพิ่มในยอดขาย
  const vatRate = 7; // future: ดึงจาก config

  const vatAmount =
    safeFinalPrice > 0
      ? round2((safeFinalPrice * vatRate) / (100 + vatRate))
      : 0;

  const priceBeforeVat =
    safeFinalPrice > 0
      ? round2(safeFinalPrice - vatAmount)
      : 0;
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
    (currentSaleMode === 'CREDIT' &&
      validSaleItems.length > 0 &&
      hasValidCustomerId &&
      !hasImmediatePayment);

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

      // ✅ CREDIT policy: prohibit immediate payments (allow DEPOSIT only)
      if (currentSaleMode === 'CREDIT' && hasImmediatePayment) {
        setPaymentError('โหมดเครดิต: ห้ามกรอกเงินสด/โอน/บัตรทันที (อนุญาตเฉพาะ “มัดจำ”)');
        return null;
      }

      // ✅ Snapshot payments from UI (do NOT persist change)
      // - For CASH, persist only the amount that actually settles the bill (cashReceived - change)
      // - This keeps Sale.paidAmount aligned with real revenue, and prevents "ยอดรวม vs ชำระแล้ว" mismatch
      const paymentsSnapshot = (paymentList || []).map((p) => {
        const method = String(p?.method || '').toUpperCase();
        const amount = parseMoney(p?.amount);

        if (method === 'CASH') {
          const appliedCash = Math.max(amount - parseMoney(calc?.safeChangeAmount), 0);
          return { ...p, amount: appliedCash };
        }

        return { ...p, amount };
      });

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
        // ✅ CASH fallback: ถ้ายังเป็น NONE ให้พิมพ์ใบเสร็จ เพื่อกันจังหวะ saleOption ยังไม่ถูก set จาก PaymentSummary
        const computedSaleOption = isCreditSale
          ? 'DELIVERY_NOTE'
          : saleOption === 'NONE'
            ? 'RECEIPT'
            : saleOption;

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
      // 🟢 [SYNTAX FIXED]: ชำระสลักไลฟ์สไตล์ไวยากรณ์กลับเป็นบล็อก finally มหาชน ไร้จุดระเบิด ESLint แน่นอนครับ
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
    calc?.safeChangeAmount,
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
    /* 🟢 [LAYOUT DETACHED]: ปลดล็อกคำสั่ง min-w-[1530px] ออกทั้งหมด เปลี่ยนมาใช้ระบบ Grid ครอบยืดหยุ่น หดรับหน้าจอจริง ปราบปัญหาเลนล่างขี่กันเสร็จเด็ดขาด */
    <div className="w-full p-2 bg-slate-50/20 rounded-xl select-none animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch justify-center">
        
        {/* รายละเอียดส่วนลดและการคำนวณเงินท้ายบิล */}
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

        {/* วิธีและช่องทางรับเงินสด / เงินโอน / บัตร EDC */}
        <div className="lg:col-span-4 flex">
          <div className="bg-white border border-slate-200 rounded-xl p-3 w-full flex flex-col justify-center shadow-sm">
            {!isCreditSale ? (
              <PaymentMethodInput
                cash={paymentList.find((p) => p.method === 'CASH')?.amount || ''}
                transfer={paymentList.find((p) => p.method === 'TRANSFER')?.amount || ''}
                credit={paymentList.find((p) => p.method === 'CARD')?.amount || ''}
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
                  setPaymentAmount('CARD', cleaned);
                }}
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

        {/* บล็อกสรุปผลลัพธ์ดุลบิล และปุ่มกดยืนยันชำระเงินปิดบิล */}
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