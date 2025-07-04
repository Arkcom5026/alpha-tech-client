// PaymentSection component
import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import usePaymentStore from '@/features/payment/store/paymentStore';
import { useNavigate } from 'react-router-dom';

const PaymentSection = ({ saleItems, onConfirm, isSubmitting, onSaleConfirmed, setClearPhoneTrigger }) => {
  const navigate = useNavigate();

  const {
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
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
  });
  const [paymentError, setPaymentError] = useState(''); // State สำหรับข้อความ Error การชำระเงิน

  const handleToggle = (method) => {
    // สลับสถานะของช่องทางการชำระเงิน
    setPaymentMethods(prev => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

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
  }, [customerDepositAmount, safeFinalPrice]);

  const handleDepositUsedChange = (e) => { // เปลี่ยนเป็นรับ event
    // จัดการการเปลี่ยนแปลงยอดเงินมัดจำที่ใช้
    const amount = parseFloat(e.target.value) || 0; // ดึงค่าจาก e.target.value
    const safeAmount = Math.min(amount, customerDepositAmount); // ไม่ให้เกินยอดมัดจำที่มี
    setDepositUsed(safeAmount);
  };

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

  const handleConfirm = async () => {
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
    if (totalPaid + safeDepositUsed < totalToPay) {
        setPaymentError('ยอดเงินที่ชำระยังไม่เพียงพอ');
        return;
    }
    if (safeBillDiscount > totalOriginalPrice) {
        setPaymentError('ส่วนลดท้ายบิลห้ามเกินยอดรวมราคาสินค้า');
        return;
    }

    try {
      setIsSubmitting(true); // ตั้งค่าสถานะกำลังส่งข้อมูล
      const confirmedSale = await confirmSaleOrderAction(); // ยืนยันคำสั่งขาย
      console.log('✅ ยืนยันการขายสำเร็จ saleId:', confirmedSale?.id);

      if (confirmedSale?.id) {
        const updatedPayments = [...paymentList];

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({ method: 'DEPOSIT', amount: safeDepositUsed, customerDepositId: selectedDeposit.id });
          console.log('✅ เพิ่มรายการชำระแบบ DEPOSIT ลงใน paymentList');
        }

        const validPayments = updatedPayments.filter(p => parseFloat(p.amount) > 0);
        if (validPayments.length === 0) {
          setPaymentError("⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินที่มากกว่า 0");
          return;
        }

        console.log('📤 เริ่มส่งข้อมูลการชำระเงิน...');
        await submitMultiPaymentAction({
          saleId: confirmedSale.id,
          netPaid: grandTotalPaid,
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

      setIsSubmitting(false);
      setDepositUsed(0);
      setCardRef('');
      setBillDiscount(0);
      resetSaleOrderAction?.();
      clearCustomerAndDeposit();
      setCustomerIdAction(null);
      setClearPhoneTrigger?.(Date.now());
      console.log('🧹 เคลียร์หน้าจอเตรียมขายรอบใหม่แล้ว');
    }
  };

  // เงื่อนไขในการเปิดใช้งานปุ่มยืนยันการขาย
  const hasValidCustomerId = !!effectiveCustomer?.id;
  const isConfirmEnabled = totalPaid + safeDepositUsed >= totalToPay && safeDepositUsed <= safeFinalPrice && hasValidCustomerId && validSaleItems.length > 0;

  const handleBillDiscountChange = (e) => {
    // จัดการการเปลี่ยนแปลงส่วนลดท้ายบิล
    const newDiscount = Number(e.target.value) || 0;
    // อนุญาตให้ส่วนลดเป็น 0 หรือค่าบวกที่ไม่เกินราคาสินค้า
    if (newDiscount >= 0 && newDiscount <= totalOriginalPrice) {
      setBillDiscount(newDiscount);
    } else if (newDiscount < 0) {
      setBillDiscount(0); // ไม่ให้ส่วนลดติดลบ
    }
    // ไม่ต้อง setBillDiscount ถ้าเกิน totalOriginalPrice เพราะจะแสดง error message แทน
  };

  return (
    <div className='font-bold'>
      {/* เลือกการชำระ */}
      <div className='flex justify-center mb-6'>
        <div className="flex gap-6 p-3 bg-white rounded-xl shadow-md">
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
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow min-w-[850px] flex flex-wrap justify-center gap-4">

        {/* รายละเอียด */}
        <div className="flex-1 min-w-[350px] max-w-[400px] bg-slate-50 p-4 rounded-xl space-y-2 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-gray-800 mb-3">รายละเอียดการคำนวณ</h2>
          <hr className="border-gray-200" />
          <div className="flex justify-between px-2 py-1 text-lg text-gray-700">
            <span>ยอดรวมราคาสินค้า</span>
            <span className="font-semibold">{totalOriginalPrice.toLocaleString()} ฿</span>
          </div>
          <div className="flex justify-between px-4 text-base text-orange-700">
            <span>ส่วนลดต่อรายการ</span>
            <span className="font-medium">{totalDiscountOnly.toLocaleString()} ฿</span>
          </div>

          <div className="flex justify-between items-center gap-2 px-4 text-base text-orange-700">
            <span>ส่วนลดท้ายบิล</span>
            <input
              type="number"
              className={`w-[120px] h-[45px] border rounded-md px-2 text-lg text-right focus:ring-2 shadow-sm ${safeBillDiscount > totalOriginalPrice ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'}`}
              placeholder="0.00"
              value={safeBillDiscount === 0 ? '' : safeBillDiscount}
              onChange={handleBillDiscountChange}
            />
          </div>

          {safeBillDiscount > totalOriginalPrice && (
            <div className="text-red-600 text-sm mt-1 text-right px-2">
              ⚠️ ส่วนลดท้ายบิลห้ามเกินยอดรวมสินค้า ({totalOriginalPrice.toLocaleString()} ฿)
            </div>
          )}

          <div className="flex justify-between px-4 text-base text-orange-700">
            <span>รวมส่วนลดทั้งหมด</span>
            <span className="font-medium">{totalDiscount.toLocaleString()} ฿</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between text-lg px-2 py-2 text-gray-700">
            <span>ยอดก่อนภาษี (Net)</span>
            <span className="font-semibold">{priceBeforeVat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
          </div>
          <div className="flex justify-between text-base px-2 text-red-600">
            <span>Vat 7%</span>
            <span className="font-medium">{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
          </div>
          <hr className="border-gray-200" />

          {/* 💰 มัดจำ */}
          {customerDepositAmount > 0 && (
            <div className="flex justify-between items-center px-2 py-1">
              <span className="text-blue-700 text-lg">ใช้มัดจำ</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-[120px] h-[40px] border border-blue-300 rounded-md px-2 text-right text-blue-800 text-lg focus:ring-2 focus:ring-blue-400 shadow-sm"
                value={depositUsed === 0 ? '' : depositUsed}
                onChange={handleDepositUsedChange}
              />
            </div>
          )}

          <div className="flex justify-between px-2 pt-1 text-blue-700 text-lg">
            <span>มัดจำคงเหลือ:</span>
            <span className="font-bold text-blue-600">{customerDepositAmount.toLocaleString()} ฿</span>
          </div>
          <hr className="border-gray-200" />
        </div>

        {/* เงินสด */}
        {paymentMethods.cash && (
          <div className="flex-1 min-w-[250px] max-w-[300px] bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 mb-3">เงินสด</h2>
            <hr className="border-gray-200" />

            <div className='py-4'>
              <label className="block text-base font-bold text-gray-700 mb-1">ยอดที่รับ (เงินสด)</label>
              <input
                type="number"
                className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-green-700 focus:ring-2 focus:ring-green-500 shadow-sm"
                placeholder="0.00"
                value={paymentList.find(p => p.method === 'CASH')?.amount || ''}
                onChange={(e) => setPaymentAmount('CASH', e.target.value)}
              />
            </div>

            <div className='py-4'>
              <label className="block text-base font-bold text-gray-700 mb-1">เงินทอน</label>
              <div className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-2xl text-right font-bold text-red-600 flex items-center justify-end">
                {safeChangeAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
              </div>
            </div>
            <div className="text-sm text-gray-700 font-bold mt-2">
              ต้องรับเงินสดอย่างน้อย: <span className="text-blue-700">{remainingToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
            </div>
          </div>
        )}

        {/* เงินโอน */}
        {paymentMethods.transfer && (
          <div className="flex-1 min-w-[250px] max-w-[300px] bg-sky-50 p-4 rounded-xl shadow-sm border border-sky-100">
            <h2 className="text-xl font-bold text-gray-800 mb-3">เงินโอน</h2>
            <hr className="border-gray-200" />
            <div className='py-4'>
              <label className="block text-base font-bold text-gray-700 mb-1">ยอดรวมเงินโอน</label>
              <input
                type="number"
                className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 shadow-sm"
                placeholder="0.00"
                value={paymentList.find(p => p.method === 'TRANSFER')?.amount || ''}
                onChange={(e) => setPaymentAmount('TRANSFER', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* บัตรเครดิต */}
        {paymentMethods.credit && (
          <div className="flex-1 min-w-[250px] max-w-[300px] bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
            <h2 className="text-xl font-bold text-gray-800 mb-3">บัตรเครดิต</h2>
            <hr className="border-gray-200" />
            <div className='py-4'>
              <label className="block text-base font-bold text-gray-700 mb-1">ยอดบัตรเครดิต</label>
              <input
                type="number"
                className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-yellow-700 focus:ring-2 focus:ring-yellow-500 shadow-sm"
                placeholder="0.00"
                value={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
                onChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
              />
            </div>
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
          </div>
        )}

        {/* สรุปยอด + ปุ่มยืนยัน */}
        <div className="flex-1 min-w-[300px] max-w-[400px] bg-lime-50 p-4 rounded-xl flex flex-col justify-between shadow-sm border border-lime-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">สรุปยอดรวม</h2>
            <hr className="border-gray-200" />
            <div className="text-lg text-gray-700 mt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl font-bold text-gray-900">ยอดสุทธิที่ต้องชำระ</span>
                <span className="text-3xl font-extrabold text-blue-700">{totalToPay.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
              </div>
              <hr className="border-gray-200 my-2" />

              <div className="flex justify-between py-1 text-base">
                <span className="text-green-700 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>เงินสด</span>
                <span className="text-green-600 font-semibold">{cashAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
              </div>

              <div className="flex justify-between py-1 text-base">
                <span className="text-cyan-800 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>เงินโอน</span>
                <span className="text-cyan-800 font-semibold">{transferAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
              </div>

              <div className="flex justify-between py-1 text-base">
                <span className="text-amber-700 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>บัตรเครดิต</span>
                <span className="text-amber-500 font-semibold">{creditAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
              </div>

              <div className="flex justify-between py-1 text-base">
                <span className="text-purple-700 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L17.5 12.5m-4.42 2.5l1.58 1.58M12 18a8 8 0 100-16 8 8 0 000 16z" /></svg>เงินมัดจำ</span>
                <span className="text-purple-600 font-semibold">{safeDepositUsed.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
              </div>

              <hr className="border-gray-200 my-2" />

              <div className="flex justify-between font-semibold text-base py-1">
                <span className="font-bold text-xl text-gray-900">รวมยอดทั้งหมด</span>
                <span className={grandTotalPaid >= totalToPay ? 'text-green-600 text-2xl font-extrabold' : 'text-red-600 text-2xl font-extrabold'}>
                  {grandTotalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                </span>
              </div>
            </div>
            <hr className="border-gray-200 my-2" />

            <div className="space-y-3 py-3">
              <h3 className="text-lg font-semibold text-gray-800">ตัวเลือกการพิมพ์บิล:</h3>
              <div className="pl-3 space-y-2 text-base text-gray-700">
                <label className="block flex items-center"><input type="radio" value="NONE" checked={saleOption === 'NONE'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2" /> ไม่พิมพ์บิล</label>
                <label className="block flex items-center"><input type="radio" value="RECEIPT" checked={saleOption === 'RECEIPT'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2" /> ใบกำกับภาษี อย่างย่อ</label>
                <label className="block flex items-center"><input type="radio" value="TAX_INVOICE" checked={saleOption === 'TAX_INVOICE'} onChange={(e) => setSaleOption(e.target.value)} className="form-radio text-blue-600 mr-2" /> ใบกำกับภาษี เต็มรูป</label>
              </div>
            </div>
          </div>

          {paymentError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-base mb-4" role="alert">
              <strong className="font-bold">ข้อผิดพลาด!</strong>
              <span className="block sm:inline"> {paymentError}</span>
            </div>
          )}

          <div className="text-center py-2 mt-auto">
            <button
              onClick={handleConfirm}
              disabled={!isConfirmEnabled || isSubmitting}
              className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-2xl font-bold transition-colors duration-200 shadow-lg flex items-center justify-center w-full"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-7 w-7 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              ยืนยันการขาย
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSection;