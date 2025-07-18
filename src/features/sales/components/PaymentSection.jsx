// PaymentSection component (Refactored to use sub-components)
import React, { useState, useEffect, useCallback } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import usePaymentStore from '@/features/payment/store/paymentStore';
import { useNavigate } from 'react-router-dom';

// Import Components ย่อยๆ ที่สร้างขึ้นใหม่
import PaymentSummary from './PaymentSummary';
import PaymentMethodInput from './PaymentMethodInput';
import CalculationDetails from './CalculationDetails';
import BillPrintOptions from './BillPrintOptions';

// ✨ รับ onSaleModeChange และ currentSaleMode เข้ามา
const PaymentSection = ({ saleItems, onConfirm, isSubmitting, setIsSubmitting, onSaleConfirmed, setClearPhoneTrigger, onSaleModeChange, currentSaleMode }) => {
  const navigate = useNavigate();

  const {
    billDiscount,
    setBillDiscount,
    setPaymentAmount, // ✨ ต้องใช้ setPaymentAmount จาก useSalesStore
    paymentList,
    confirmSaleOrderAction,
    cardRef,
    setCardRef,
    resetSaleOrderAction,
    setCustomerIdAction,
  } = useSalesStore();

  const { submitMultiPaymentAction } = usePaymentStore();
  const {
    customerDepositAmount,
    selectedCustomer,
    selectedDeposit,
    depositUsed,
    setDepositUsed,
    applyDepositUsageAction,
    clearCustomerAndDeposit,
  } = useCustomerDepositStore();

  const [saleOption, setSaleOption] = useState('NONE'); // ตัวเลือกการพิมพ์บิล
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    transfer: false,
    credit: false,
    agencyCredit: false, // ✨ เพิ่มตัวเลือกเครดิต/หน่วยงาน
  });
  const [paymentError, setPaymentError] = useState(''); // State สำหรับข้อความ Error การชำระเงิน

  const handleToggle = useCallback((method) => {
    setPaymentMethods(prev => {
      const newState = { ...prev, [method]: !prev[method] };

      if (method === 'agencyCredit') {
        if (newState.agencyCredit) {
          // ถ้าเลือกเครดิต/หน่วยงาน ให้ตั้งค่า saleMode เป็น CREDIT และเคลียร์ช่องทางการชำระเงินอื่น
          onSaleModeChange('CREDIT');
          setPaymentAmount('CASH', 0); // เคลียร์เงินสด
          setPaymentAmount('TRANSFER', 0); // เคลียร์เงินโอน
          setPaymentAmount('CREDIT', 0); // เคลียร์บัตรเครดิต
          setCardRef(''); // เคลียร์เลขอ้างอิงบัตร
          return { cash: false, transfer: false, credit: false, agencyCredit: true };
        } else {
          // ถ้าไม่เลือกเครดิต/หน่วยงาน ให้กลับไปที่ CASH mode และเปิดใช้งานเงินสดเป็นค่าเริ่มต้น
          onSaleModeChange('CASH');
          return { cash: true, transfer: false, credit: false, agencyCredit: false };
        }
      } else {
        // ถ้าเลือกช่องทางการชำระเงินอื่น
        if (newState[method]) { // ถ้าช่องทางนี้ถูกเปิดใช้งาน
          // ปิดเครดิต/หน่วยงาน และตั้งค่า saleMode เป็น CASH
          if (newState.agencyCredit) {
            newState.agencyCredit = false;
            onSaleModeChange('CASH');
          }
        }
        return newState;
      }
    });
  }, [onSaleModeChange, setPaymentAmount, setCardRef]); // ✨ เพิ่ม setPaymentAmount, setCardRef ใน dependency array

  const effectiveCustomer = selectedCustomer || { id: null, name: 'ลูกค้าทั่วไป' }; // ลูกค้าปัจจุบัน
  const validSaleItems = Array.isArray(saleItems) ? saleItems : []; // ตรวจสอบว่าเป็น Array
  // คำนวณยอดรวมต่างๆ
  const totalOriginalPrice = validSaleItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalDiscountOnly = validSaleItems.reduce((sum, item) => sum + (item.discountWithoutBill || 0), 0);
  const safeBillDiscount = typeof billDiscount === 'number' && !isNaN(billDiscount) ? billDiscount : 0;
  const totalDiscount = totalDiscountOnly + safeBillDiscount;
  const safeFinalPrice = Math.max(totalOriginalPrice - totalDiscountOnly - safeBillDiscount, 0);

  useEffect(() => {
    // คำนวณยอดเงินมัดจำที่แนะนำให้ใช้
    const suggested = Math.min(customerDepositAmount, safeFinalPrice);
    setDepositUsed(suggested);
  }, [customerDepositAmount, safeFinalPrice, setDepositUsed]); // เพิ่ม setDepositUsed ใน dependency array

  const handleDepositUsedChange = useCallback((e) => {
    // จัดการการเปลี่ยนแปลงยอดเงินมัดจำที่ใช้
    const amount = parseFloat(e.target.value) || 0;
    const safeAmount = Math.min(amount, customerDepositAmount);
    setDepositUsed(safeAmount);
  }, [customerDepositAmount, setDepositUsed]); // เพิ่ม setDepositUsed ใน dependency array

  const priceBeforeVat = safeFinalPrice / 1.07; // คำนวณราคาก่อนภาษี
  const vatAmount = safeFinalPrice - priceBeforeVat; // คำนวณภาษีมูลค่าเพิ่ม
  const safeDepositUsed = Math.min(depositUsed, safeFinalPrice); // ยอดมัดจำที่ใช้จริง (ไม่เกินยอดที่ต้องชำระ)
  const totalToPay = safeFinalPrice; // ยอดรวมที่ต้องชำระ

  // ยอดเงินที่รับมาในแต่ละช่องทาง
  const cashAmount = Number(paymentList.find(p => p.method === 'CASH')?.amount || 0);
  const transferAmount = Number(paymentList.find(p => p.method === 'TRANSFER')?.amount || 0);
  const creditAmount = Number(paymentList.find(p => p.method === 'CREDIT')?.amount || 0);

  // ยอดรวมที่ชำระแล้ว (ไม่รวมเงินทอน)
  const totalPaid = paymentList.reduce((sum, p) => {
    const amount = parseFloat(p.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const paidByOther = totalPaid - cashAmount; // ยอดที่ชำระด้วยช่องทางอื่นที่ไม่ใช่เงินสด
  const remainingToPay = Math.max(totalToPay - paidByOther - safeDepositUsed, 0); // ยอดที่เหลือต้องชำระด้วยเงินสด
  const safeChangeAmount = Math.max(cashAmount - remainingToPay, 0); // เงินทอน
  const totalPaidNet = totalPaid - safeChangeAmount; // ยอดเงินที่รับสุทธิ (ไม่รวมเงินทอน)
  const grandTotalPaid = totalPaidNet + safeDepositUsed; // ยอดรวมที่ชำระทั้งหมด (รวมมัดจำ)

  // เงื่อนไขในการเปิดใช้งานปุ่มยืนยันการขาย
  const hasValidCustomerId = !!effectiveCustomer?.id;
  // ✨ ปรับเงื่อนไขการยืนยันการขายตาม saleMode
  const isConfirmEnabled =
    (currentSaleMode === 'CASH' && totalPaid + safeDepositUsed >= totalToPay && safeDepositUsed <= safeFinalPrice && hasValidCustomerId && validSaleItems.length > 0) ||
    (currentSaleMode === 'CREDIT' && hasValidCustomerId && validSaleItems.length > 0);


  const handleConfirm = useCallback(async () => {
    setPaymentError(''); // ล้างข้อความ Error ก่อนยืนยัน
    console.log('🔍 safeDepositUsed:', safeDepositUsed);
    console.log('🔍 selectedDeposit?.id:', selectedDeposit?.id);
    const customerIdToUse = effectiveCustomer?.id;

    if (!hasValidCustomerId) {
      setPaymentError('กรุณาเลือกหรือสร้างข้อมูลลูกค้าก่อนยืนยันการขาย');
      return;
    }
    if (validSaleItems.length === 0) {
      setPaymentError('กรุณาเพิ่มรายการสินค้าก่อนยืนยันการขาย');
      return;
    }
    if (isSubmitting) {
      setPaymentError('กำลังดำเนินการ กรุณารอสักครู่');
      return;
    }
    // ✨ ตรวจสอบยอดเงินที่ชำระเฉพาะในโหมด CASH
    if (currentSaleMode === 'CASH' && totalPaid + safeDepositUsed < totalToPay) {
      setPaymentError('ยอดเงินที่ชำระยังไม่เพียงพอ');
      return;
    }
    if (safeBillDiscount > totalOriginalPrice) {
      setPaymentError('ส่วนลดท้ายบิลห้ามเกินยอดรวมราคาสินค้า');
      return;
    }

    try {
      setIsSubmitting(true); // <--- เรียกใช้ setIsSubmitting ที่ได้รับมา
      const confirmedSale = await confirmSaleOrderAction(); // ยืนยันคำสั่งขาย
      console.log('✅ ยืนยันการขายสำเร็จ saleId:', confirmedSale?.id);

      if (confirmedSale?.id) {
        const updatedPayments = [...paymentList];

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({ method: 'DEPOSIT', amount: safeDepositUsed, customerDepositId: selectedDeposit.id });
          console.log('✅ เพิ่มรายการชำระแบบ DEPOSIT ลงใน paymentList');
        }

        // ✨ ตรวจสอบ validPayments เฉพาะในโหมด CASH
        if (currentSaleMode === 'CASH') {
          const validPayments = updatedPayments.filter(p => parseFloat(p.amount) > 0);
          if (validPayments.length === 0 && safeDepositUsed === 0) { // ต้องมี payment หรือ deposit ถ้าเป็น CASH
            setPaymentError("⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินที่มากกว่า 0 หรือใช้มัดจำ");
            return;
          }
        }


        console.log('📤 เริ่มส่งข้อมูลการชำระเงิน...');
        await submitMultiPaymentAction({
          saleId: confirmedSale.id,
          netPaid: grandTotalPaid, // netPaid อาจจะต้องปรับถ้าเป็น CREDIT sale
          paymentList: updatedPayments,
        });
        console.log('✅ ส่งข้อมูลชำระเงินสำเร็จ');

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          await applyDepositUsageAction({
            depositId: selectedDeposit.id,
            amountUsed: safeDepositUsed,
            saleId: confirmedSale.id,
          });
          console.log('✅ อัปเดตสถานะการใช้เงินมัดจำเรียบร้อย');
        }

        // นำทางไปยังหน้าพิมพ์บิลตามตัวเลือก
        if (saleOption === 'RECEIPT') {
          navigate('/pos/sales/bill/print-short/' + confirmedSale.id, {
            state: { payment: updatedPayments }
          });
        } else if (saleOption === 'TAX_INVOICE') {
          navigate('/pos/sales/bill/print-full/' + confirmedSale.id, {
            state: { payment: updatedPayments }
          });
        } else if (saleOption === 'NONE' && currentSaleMode === 'CREDIT') {
          // ถ้าเป็นเครดิต/หน่วยงาน และไม่เลือกพิมพ์บิล ก็ให้กลับไปหน้าหลัก
          navigate('/pos/sale'); // หรือหน้าที่เหมาะสม
        }


        if (typeof onSaleConfirmed === 'function') {
          onSaleConfirmed();
        }
      } else {
        setPaymentError('❌ ไม่พบ ID ของรายการขายหลังจากยืนยัน');
      }
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
      setPaymentError('❌ ยืนยันการขายล้มเหลว: ' + (err.message || 'เกิดข้อผิดพลาด'));
    } finally {
      // เคลียร์ข้อมูลและรีเซ็ตสถานะหลังจากยืนยันการขาย
      setTimeout(() => {
        const phoneInput = document.getElementById('customer-phone-input');
        if (phoneInput) {
          phoneInput.focus();
          phoneInput.select();
        }
      }, 100);

      setIsSubmitting(false); // <--- เรียกใช้ setIsSubmitting ที่ได้รับมา
      setDepositUsed(0);
      setCardRef('');
      setBillDiscount(0);
      resetSaleOrderAction?.();
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setClearPhoneTrigger?.(Date.now());
      onSaleModeChange('CASH'); // ✨ รีเซ็ต saleMode กลับเป็น CASH
      console.log('🧹 เคลียร์หน้าจอเตรียมขายรอบใหม่แล้ว');
    }
  }, [
    hasValidCustomerId, validSaleItems.length, isSubmitting, totalPaid, safeDepositUsed, totalToPay, safeBillDiscount, totalOriginalPrice,
    confirmSaleOrderAction, paymentList, selectedDeposit?.id, submitMultiPaymentAction, grandTotalPaid, applyDepositUsageAction,
    saleOption, navigate, onSaleConfirmed, setDepositUsed, setCardRef, setBillDiscount, resetSaleOrderAction, clearCustomerAndDeposit,
    setCustomerIdAction, setClearPhoneTrigger, effectiveCustomer?.id, effectiveCustomer, setIsSubmitting, currentSaleMode, onSaleModeChange
  ]);


  const handleBillDiscountChange = useCallback((e) => {
    // จัดการการเปลี่ยนแปลงส่วนลดท้ายบิล
    const newDiscount = Number(e.target.value) || 0;
    // อนุญาตให้ส่วนลดเป็น 0 หรือค่าบวกที่ไม่เกินราคาสินค้า
    if (newDiscount >= 0 && newDiscount <= totalOriginalPrice) {
      setBillDiscount(newDiscount);
    } else if (newDiscount < 0) {
      setBillDiscount(0); // ไม่ให้ส่วนลดติดลบ
    }
    // ไม่ต้อง setBillDiscount ถ้าเกิน totalOriginalPrice เพราะจะแสดง error message แทน
  }, [setBillDiscount, totalOriginalPrice]); // เพิ่ม setBillDiscount ใน dependency array

  return (
    <div className='font-bold'>
      {/* เลือกการชำระ */}
      <div className='flex justify-center mb-2 '>
        <div className="flex gap-4 p-3 bg-white   ">
          <label className="inline-flex items-center gap-2 text-gray-700 text-lg">
            <input
              type="checkbox"
              checked={paymentMethods.cash}
              onChange={() => handleToggle('cash')}
              className="form-checkbox h-5 w-5 text-green-600 rounded"
            />
            เงินสด
          </label>
          <label className="inline-flex items-center gap-2 text-gray-700 text-lg">
            <input
              type="checkbox"
              checked={paymentMethods.transfer}
              onChange={() => handleToggle('transfer')}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            เงินโอน
          </label>
          <label className="inline-flex items-center gap-2 text-gray-700 text-lg">
            <input
              type="checkbox"
              checked={paymentMethods.credit}
              onChange={() => handleToggle('credit')}
              className="form-checkbox h-5 w-5 text-yellow-600 rounded"
            />
            บัตรเครดิต
          </label>
          {/* ✨ เพิ่มตัวเลือกเครดิต/หน่วยงาน */}
          <label className="inline-flex items-center gap-2 text-gray-700 text-lg">
            <input
              type="checkbox"
              checked={paymentMethods.agencyCredit}
              onChange={() => handleToggle('agencyCredit')}
              className="form-checkbox h-5 w-5 text-purple-600 rounded"
            />
            เครดิต/หน่วยงาน
          </label>
        </div>
      </div>


        <div className="bg-white  flex justify-center gap-4 py-4">

          {/* คอลัมน์ที่ 1: รายละเอียดการคำนวณ - ย้ายมาอยู่ก่อน PaymentSummary */}
          <CalculationDetails
            totalOriginalPrice={totalOriginalPrice}
            totalDiscountOnly={totalDiscountOnly}
            billDiscount={billDiscount}
            setBillDiscount={handleBillDiscountChange} // ส่ง handleBillDiscountChange ที่ใช้ useCallback
            totalDiscount={totalDiscount}
            priceBeforeVat={priceBeforeVat}
            vatAmount={vatAmount}
            customerDepositAmount={customerDepositAmount}
            depositUsed={depositUsed}
            handleDepositUsedChange={handleDepositUsedChange} // ส่ง handleDepositUsedChange ที่ใช้ useCallback
          />


          {/* คอลัมน์ที่ 2: ช่องทางการชำระเงิน (แยกตามประเภท) - แสดงเฉพาะในโหมด CASH */}
          {currentSaleMode === 'CASH' && (
            <div className="flex-1 min-w-[300px] max-w-[300px] space-y-4">
              {paymentMethods.cash && (
                <PaymentMethodInput
                  method="CASH"
                  label="เงินสด"
                  value={paymentList.find(p => p.method === 'CASH')?.amount || ''}
                  onChange={(e) => setPaymentAmount('CASH', e.target.value)}
                  colorClass="green"
                />
              )}
              {paymentMethods.transfer && (
                <PaymentMethodInput
                  method="TRANSFER"
                  label="เงินโอน"
                  value={paymentList.find(p => p.method === 'TRANSFER')?.amount || ''}
                  onChange={(e) => setPaymentAmount('TRANSFER', e.target.value)}
                  colorClass="sky"
                />
              )}
              {paymentMethods.credit && (
                <PaymentMethodInput
                  method="CREDIT"
                  label="บัตรเครดิต"
                  value={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
                  onChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
                  colorClass="yellow"
                  bottomContent={
                    <div className='py-4'>
                      <label className="text-base mt-2 block font-bold text-gray-700 mb-1">เลขอ้างอิงบัตรเครดิต</label>
                      <input
                        type="text"
                        value={cardRef}
                        onChange={(e) => setCardRef(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-base text-gray-800 h-[45px] focus:ring-2 focus:ring-yellow-500 shadow-sm"
                        placeholder="กรอกเลขอ้างอิงจากเครื่องรูดบัตร"
                        maxLength={24}
                      />
                    </div>
                  }
                />
              )}
            </div>
          )}

          {/* คอลัมน์ที่ 3: สรุปยอดรวม (เด่นที่สุด) - ย้ายมาอยู่หลัง CalculationDetails */}
          <PaymentSummary
            totalToPay={totalToPay}
            grandTotalPaid={grandTotalPaid}
            safeChangeAmount={safeChangeAmount}
            isConfirmEnabled={isConfirmEnabled}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirm}
            paymentError={paymentError}
            // ส่ง props สำหรับ BillPrintOptions ไปยัง PaymentSummary
            saleOption={saleOption}
            setSaleOption={setSaleOption}
            currentSaleMode={currentSaleMode} // ✨ ส่ง currentSaleMode ไปยัง PaymentSummary
          />

        </div>


    </div>
  );
};

export default PaymentSection;