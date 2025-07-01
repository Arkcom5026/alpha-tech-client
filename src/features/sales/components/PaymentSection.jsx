import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';
import usePaymentStore from '@/features/payment/store/paymentStore';
import { Navigate } from 'react-router-dom';


const PaymentSection = ({ saleItems }) => {
  const {
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
    paymentList,
    confirmSaleOrderAction,
    cardRef,
    setCardRef,
  } = useSalesStore();

  const { submitMultiPaymentAction } = usePaymentStore();
  const { customer } = useCustomerStore();
  const {
    customerDepositAmount,
    selectedCustomer,
    selectedDeposit,
    depositUsed,
    setDepositUsed,
  } = useCustomerDepositStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saleOption, setSaleOption] = useState('NONE');
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    transfer: false,
    credit: false,
  });

  const handleToggle = (method) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const effectiveCustomer = selectedCustomer || customer || { id: null, name: 'ลูกค้าทั่วไป' };
  const validSaleItems = Array.isArray(saleItems) ? saleItems : [];
  const totalOriginalPrice = validSaleItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalDiscountOnly = validSaleItems.reduce((sum, item) => sum + (item.discountWithoutBill || 0), 0);
  const safeBillDiscount = typeof billDiscount === 'number' && !isNaN(billDiscount) ? billDiscount : 0;
  const totalDiscount = totalDiscountOnly + safeBillDiscount;
  const safeFinalPrice = Math.max(totalOriginalPrice - totalDiscountOnly - safeBillDiscount, 0);

  useEffect(() => {
    const suggested = Math.min(customerDepositAmount, safeFinalPrice);
    setDepositUsed(suggested);
  }, [customerDepositAmount, safeFinalPrice]);

  const handleDepositUsedChange = (value) => {
    const amount = parseFloat(value) || 0;
    const safeAmount = Math.min(amount, customerDepositAmount);
    setDepositUsed(safeAmount);
  };

  const priceBeforeVat = safeFinalPrice / 1.07;
  const vatAmount = safeFinalPrice - priceBeforeVat;
  const safeDepositUsed = Math.min(depositUsed, safeFinalPrice);
  const totalToPay = safeFinalPrice;

  const cashAmount = Number(paymentList.find(p => p.method === 'CASH')?.amount || 0);
  const transferAmount = Number(paymentList.find(p => p.method === 'TRANSFER')?.amount || 0);
  const creditAmount = Number(paymentList.find(p => p.method === 'CREDIT')?.amount || 0);


  const totalPaid = paymentList.reduce((sum, p) => {
    const amount = parseFloat(p.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const paidByOther = totalPaid - cashAmount;
  const remainingToPay = Math.max(totalToPay - paidByOther - safeDepositUsed, 0);
  const safeChangeAmount = Math.max(cashAmount - remainingToPay, 0);
  const totalPaidNet = totalPaid - safeChangeAmount;
  const grandTotalPaid = totalPaidNet + safeDepositUsed;

  const handleConfirm = async () => {
    const customerIdToUse = effectiveCustomer?.id;
    if (!customerIdToUse || !validSaleItems.length || isSubmitting) {
      console.warn('⛔ ไม่สามารถยืนยันการขายได้ เพราะขาดข้อมูล');
      return;
    }
    try {
      setIsSubmitting(true);
      const confirmedSale = await confirmSaleOrderAction();
      console.log('✅ ยืนยันการขายสำเร็จ saleId:', confirmedSale?.id);

      if (confirmedSale?.id) {
        const updatedPayments = [...paymentList];

        if (safeDepositUsed > 0 && selectedDeposit?.id) {
          updatedPayments.push({ method: 'DEPOSIT', amount: safeDepositUsed });
          console.log('✅ เพิ่มรายการชำระแบบ DEPOSIT ลงใน paymentList');
        }

        const validPayments = updatedPayments.filter(p => parseFloat(p.amount) > 0);
        if (validPayments.length === 0) {
          console.warn("⚠️ ไม่มีรายการชำระเงินที่มีจำนวนเงินที่มากกว่า 0");
          return;
        }

        console.log('📤 เริ่มส่งข้อมูลการชำระเงิน...');
        await submitMultiPaymentAction({
          saleId: confirmedSale.id,
          netPaid: grandTotalPaid,
          paymentList: updatedPayments,
        });
        console.log('✅ ส่งข้อมูลชำระเงินสำเร็จ');

        if (saleOption === 'RECEIPT') {
          Navigate('/pos/sales/bill/print-short/' + confirmedSale.id, {
            state: { payment: updatedPayments }
          });
        } else if (saleOption === 'TAX_INVOICE') {
          Navigate('/pos/sales/bill/print-full/' + confirmedSale.id, {
            state: { payment: updatedPayments }
          });
        }
      } else {
        console.error('❌ ไม่พบ ID ของรายการขายหลังจากยืนยัน');
      }
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const hasValidCustomerId = !!effectiveCustomer?.id;
  const isConfirmEnabled = totalPaid + safeDepositUsed >= totalToPay && safeDepositUsed <= safeFinalPrice && hasValidCustomerId && validSaleItems.length > 0;

  const handleBillDiscountChange = (e) => {
    const newDiscount = Number(e.target.value) || 0;
    if (newDiscount <= totalOriginalPrice) {
      setBillDiscount(newDiscount);
    }
  };




  return (
    <div className='font-bold'>
      <div className='flex justify-center'>
        <div className="col-span-4 mb-4 flex gap-6">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={paymentMethods.cash}
              onChange={() => handleToggle('cash')}
            /> เงินสด
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={paymentMethods.transfer}
              onChange={() => handleToggle('transfer')}
            /> เงินโอน
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={paymentMethods.credit}
              onChange={() => handleToggle('credit')}
            /> บัตรเครดิต
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow min-w-[850px] flex flex-col-4 justify-center gap-4">
        <div className="mb-2 bg-slate-100 min-w-[350px] p-4 rounded-md space-y-1">
          <h2 className="text-lg font-semibold mb-2">รายละเอียด</h2>
          <hr />
          <div className="flex justify-between px-2 py-1">
            <span className='text-lg'>ยอดรวมราคาสินค้า</span>
            <span>{totalOriginalPrice.toLocaleString()} ฿</span>
          </div>
          <div className="flex justify-between  px-4 ">
            <span className='text-orange-700  text-base'>ส่วนลดต่อรายการ</span>
            <span className="text-orange-500  text-base">{totalDiscountOnly.toLocaleString()} ฿</span>
          </div>

          <div className="flex justify-between items-center gap-2 px-4 ">
            <span className='text-orange-700  text-base'>ส่วนลดท้ายบิล</span>

            <input
              type="number"
              className="mt-2 w-[120px] h-[45px] border rounded px-1 text-lg text-right"
              placeholder="0.00"
              value={safeBillDiscount === 0 ? '' : safeBillDiscount}
              onChange={handleBillDiscountChange}
            />

          </div>

          {safeBillDiscount > totalOriginalPrice && (
            <div className="text-red-600 text-sm mt-1 text-right px-2 ">
              ⚠️ ส่วนลดท้ายบิลห้ามเกินยอดรวมสินค้า ({totalOriginalPrice.toLocaleString()} ฿)
            </div>
          )}

          <div className="flex justify-between  px-4 ">
            <span className='text-orange-700  text-base'>รวมส่วนลดทั้งหมด</span>
            <span className="text-orange-700  text-base">{totalDiscount.toLocaleString()} ฿</span>
          </div>
          <hr />
          <div className="flex justify-between  text-base px-2 py-2">
            <span>ยอดก่อนภาษี (Net)</span>
            <span>{priceBeforeVat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
          </div>
          <div className="flex justify-between text-sm px-2 ">
            <span className=' text-base'>Vat 7%</span>
            <span className="text-red-600">{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
          </div>
          <hr />

          {/* 💰 มัดจำ */}
          {customerDepositAmount > 0 && (
            <div className="flex justify-between items-center  ">
              <span className="text-blue-700 px-2 text-base">ใช้มัดจำ</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-[120px] h-[40px] border rounded  text-right text-blue-800"
                value={depositUsed === 0 ? '' : depositUsed}
                onChange={(e) => handleDepositUsedChange(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-between px-2 pt-1">
            <span className='text-blue-700  text-base'>มัดจำคงเหลือ:</span>
            <span className="font-semibold text-blue-600  text-base">{customerDepositAmount.toLocaleString()} ฿</span>
          </div>
          <hr />
        </div>



        {paymentMethods.cash && (
          <div className="mb-4 min-w-[250px] bg-green-100 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 ">เงินสด</h2>
            <hr />

            <div className='py-4'>
              <label className="block text-sm font-bold text-gray-700">ยอดที่รับ (เงินสด)</label>

              <input
                type="number"
                className="mt-2 w-[140px] h-[45px] border rounded px-1 py-1 text-lg text-right"
                placeholder="0.00"
                value={paymentList.find(p => p.method === 'CASH')?.amount || ''}
                onChange={(e) => setPaymentAmount('CASH', e.target.value)}
              />

            </div>

            <div className='py-4'>
              <label className="block text-sm font-bold text-gray-700">เงินทอน</label>
              <div className="mt-2 w-[140px] h-[45px]  border rounded px-4 py-2 bg-gray-100 text-right">
                {safeChangeAmount.toLocaleString()} ฿
              </div>
            </div>
            <div className="text-sm text-gray-700 font-bold">
              ต้องรับเงินสดอย่างน้อย: {remainingToPay.toLocaleString()} ฿
            </div>

          </div>
        )}

        {paymentMethods.transfer && (
          <div className="mb-4 min-w-[250px] bg-sky-200 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">เงินโอน</h2>
            <hr />
            <div className='py-4'>
              <label className="block text-sm font-bold text-gray-700 ">ยอดรวมเงินโอน</label>
              <input
                type="number"
                className="mt-1 w-[140px] h-[45px] border rounded py-2  text-right"
                placeholder="0.00"
                value={paymentList.find(p => p.method === 'TRANSFER')?.amount || ''}
                onChange={(e) => setPaymentAmount('TRANSFER', e.target.value)}
              />
            </div>
          </div>
        )}

        {paymentMethods.credit && (
          <div className="mb-4 min-w-[250px] bg-yellow-100 p-4 rounded-md ">
            <h2 className="text-lg font-semibold mb-2">บัตรเครดิต</h2>
            <hr />
            <div className='py-4'>
              <label className="block text-sm font-bold text-gray-700">ยอดบัตรเครดิต</label>
              <input
                type="number"
                className="mt-1 border rounded text-right w-[140px] h-[45px]"
                placeholder="0.00"
                value={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
                onChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
              />
            </div>
            <div className='py-4'>
              <label className="text-sm mt-2 block font-bold">เลขอ้างอิงบัตรเครดิต</label>
              <input
                type="text"
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                className="border rounded p-1 w-full mt-1 text-sm  h-[45px]"
                placeholder="กรอกเลขอ้างอิงจากเครื่องรูดบัตร"
                maxLength={24}
              />
            </div>
          </div>
        )}


        {/* สรุปยอด + ปุ่มยืนยัน */}
        <div className="mb-4 min-w-[300px] bg-lime-100 p-3 rounded flex flex-col justify-between h-full">
          <div>
            <h2 className="text-lg font-semibold mb-2">สรุปยอด</h2>
            <hr />
            <div className="text-sm text-gray-700 mt-2">
              <div className="flex justify-between">
                <span className="text-lg">ยอดสุทธิที่ต้องชำระ</span>
                <span className="text-blue-600 text-lg">{totalToPay.toLocaleString()} ฿</span>
              </div>
              <hr />
        

              <div className="flex justify-between py-1">
                <span className="text-base text-green-700">เงินสด</span>
                <span className="text-green-600">{cashAmount.toLocaleString()} ฿</span>
              </div>

              <div className="flex justify-between">
                <span className="text-base text-cyan-800">เงินโอน</span>
                <span className="text-cyan-800">{transferAmount.toLocaleString()} ฿</span>
              </div>

              <div className="flex justify-between">
                <span className="text-base text-amber-700">บัตรเครดิต</span>
                <span className="text-amber-500">{creditAmount.toLocaleString()} ฿</span>
              </div>

              <div className="flex justify-between">
                <span className="text-base text-purple-700">เงินมัดจำ</span>
                <span className="text-purple-600">{safeDepositUsed.toLocaleString()} ฿</span>
              </div>

              <hr />

              <div className="flex justify-between font-semibold text-base py-1">
                <span className="font-bold text-lg">รวมยอดทั้งหมด</span>
                <span className={grandTotalPaid >= totalToPay ? 'text-green-600 text-lg' : 'text-red-600 text-lg'}>
                  {grandTotalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                </span>
              </div>

            </div>
            <hr />
    
            <div className="space-y-4 py-3">
              <div className="text-sm text-left space-y-2">
                <div className="pl-3 space-y-1">
                  <label className="block"><input type="radio" value="NONE" checked={saleOption === 'NONE'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ไม่พิมพ์บิล</label>
                  <label className="block"><input type="radio" value="RECEIPT" checked={saleOption === 'RECEIPT'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ใบกำกับภาษี อย่างย่อ</label>
                  <label className="block"><input type="radio" value="TAX_INVOICE" checked={saleOption === 'TAX_INVOICE'} onChange={(e) => setSaleOption(e.target.value)} className="mr-2" /> ใบกำกับภาษี เต็มรูป</label>
                </div>
              </div>
            </div>

            <div className="text-center  mt-auto py-2">
              <button
                onClick={handleConfirm}
                disabled={!isConfirmEnabled}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                ✅ ยืนยันการขาย
              </button>
            </div>
          </div>
        </div>




      </div>
    </div>
  );
};

export default PaymentSection;

