import React, { useState, useEffect } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';
import useCustomerDepositStore from '@/features/customerDeposit/store/customerDepositStore';

const PaymentSection = ({ saleItems }) => {
  const {
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
    paymentList,
    confirmSaleOrderAction,
    cardRef,
    setCardRef,
    sumPaymentList,
  } = useSalesStore();

  const { customer } = useCustomerStore();
  const {
    customerDepositAmount,
    fetchCustomerDepositAction,
    setCustomerDepositAmount,
    selectedCustomer,
  } = useCustomerDepositStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    transfer: false,
    credit: false,
  });

  useEffect(() => {
    const fetchDeposit = async () => {
      if (!selectedCustomer?.id) return;
      const deposit = await fetchCustomerDepositAction(selectedCustomer.id);
      setCustomerDepositAmount(deposit || 0);
    };
    fetchDeposit();
  }, [selectedCustomer?.id]);

  useEffect(() => {
    console.log('📌 selectedCustomer in PaymentSection:', selectedCustomer);
    console.log('📌 fallback customer:', customer);
  }, [selectedCustomer, customer]);

  const handleToggle = (method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const totalOriginalPrice = Array.isArray(saleItems)
    ? saleItems.reduce((sum, item) => sum + (item.price || 0), 0)
    : 0;

  const totalDiscountOnly = Array.isArray(saleItems)
    ? saleItems.reduce((sum, item) => sum + (item.discountWithoutBill || 0), 0)
    : 0;

  const safeBillDiscount = typeof billDiscount === 'number' && !isNaN(billDiscount) ? billDiscount : 0;
  const totalDiscount = totalDiscountOnly + safeBillDiscount;
  const totalPriceAfterDiscount = Array.isArray(saleItems)
    ? saleItems.reduce((sum, item) => sum + ((item.price || 0) - (item.discount || 0)), 0)
    : 0;

  const safeFinalPrice = Math.max(totalPriceAfterDiscount - safeBillDiscount, 0);
  const priceBeforeVat = safeFinalPrice / 1.07;
  const vatAmount = safeFinalPrice - priceBeforeVat;
  const safeSumPayment = typeof sumPaymentList === 'function' ? sumPaymentList() : 0;
  const totalToPay = Math.max(safeFinalPrice - customerDepositAmount, 0);

  const cashAmount = Number(paymentList.find(p => p.method === 'CASH')?.amount || 0);
  const transferAmount = Number(paymentList.find(p => p.method === 'TRANSFER')?.amount || 0);
  const creditAmount = Number(paymentList.find(p => p.method === 'CREDIT')?.amount || 0);
  const totalPaid = paymentList.reduce((sum, p) => {
    const amount = parseFloat(p.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const paidByOther = totalPaid - cashAmount;
  const remainingToPay = Math.max(totalToPay - paidByOther, 0);
  const safeChangeAmount = Math.max(cashAmount - remainingToPay, 0);
  const totalPaidNet = totalPaid - safeChangeAmount;

  const handleConfirm = async () => {
    const customerIdToUse = selectedCustomer?.id || customer?.id;
    if (!customerIdToUse || !saleItems.length || isSubmitting) {
      console.warn('⛔ ไม่สามารถยืนยันการขายได้ เพราะขาดข้อมูล');
      return;
    }
    try {
      setIsSubmitting(true);
      await confirmSaleOrderAction();
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidCustomerId = !!selectedCustomer?.id || !!customer?.id;
  const isConfirmEnabled = totalPaid >= totalToPay && hasValidCustomerId && saleItems.length > 0;

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
          <div className="flex justify-between text-base px-2 ">
            <span className='text-blue-700'>ยอดรวมราคาสินค้า:</span>
            <span>{totalOriginalPrice.toLocaleString()} ฿</span>
          </div>
          <div className="flex justify-between text-xs px-4 ">
            <span className='text-orange-700'>ส่วนลดต่อรายการ:</span>
            <span className="text-orange-500 text-xs">{totalDiscountOnly.toLocaleString()} ฿</span>
          </div>
          <div className="flex justify-between items-center gap-2 text-xs px-4 ">
            <span className='text-orange-700'>ส่วนลดท้ายบิล:</span>
            <input
              type="number"
              value={safeBillDiscount}
              onChange={handleBillDiscountChange}
              className={`w-24 px-2 py-1 text-right border rounded text-sm ${safeBillDiscount > totalOriginalPrice ? 'border-red-500 text-red-600' : ''}`}
            />
          </div>
          {safeBillDiscount > totalOriginalPrice && (
            <div className="text-red-600 text-sm mt-1 text-right px-2 ">
              ⚠️ ส่วนลดท้ายบิลห้ามเกินยอดรวมสินค้า ({totalOriginalPrice.toLocaleString()} ฿)
            </div>
          )}
          <div className="flex justify-between text-sm px-4 ">
            <span className='text-orange-700'>รวมส่วนลดทั้งหมด:</span>
            <span className="text-orange-700">{totalDiscount.toLocaleString()} ฿</span>
          </div>
          <hr />
          <div className="flex justify-between text-sm px-2 ">
            <span>ยอดก่อนภาษี (Net):</span>
            <span>{priceBeforeVat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
          </div>
          <div className="flex justify-between text-sm px-2 ">
            <span>Vat 7%:</span>
            <span className="text-red-600">{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
          </div>
          <hr />
          <div className="flex justify-between text-sm px-2 ">
            <span className='text-blue-700'>มัดจำคงเหลือ:</span>
            <span className="font-semibold text-blue-600">{customerDepositAmount.toLocaleString()} ฿</span>
          </div>
          <hr />
          <div className="flex justify-between text-xl font-bold text-green-700 text-right pt-2 px-6">
            <span>ยอดที่ต้องชำระ:</span>
            <span>{totalToPay.toLocaleString()} ฿</span>
          </div>
        </div>


        {paymentMethods.cash && (
          <div className="mb-4 min-w-[250px] bg-green-100 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 ">เงินสด</h2>
            <hr />            
              <div className='py-4'>
                <label className="block text-sm font-bold text-gray-700">ยอดที่รับ (เงินสด):</label>
                <input
                  type="number"
                  className="mt-2 w-[140px] h-[45px] border rounded px-1 py-1 text-lg text-right"
                  placeholder="0.00"
                  value={paymentList.find(p => p.method === 'CASH')?.amount || ''}
                  onChange={(e) => setPaymentAmount('CASH', e.target.value)}
                />
              </div>
              <div className='py-4'>
                <label className="block text-sm font-bold text-gray-700">เงินทอน:</label>
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
            <label className="block text-sm font-bold text-gray-700 ">ยอดรวมเงินโอน:</label>
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
            <label className="block text-sm font-bold text-gray-700">ยอดบัตรเครดิต:</label>
            <input
              type="number"
              className="mt-1 border rounded text-right w-[140px] h-[45px]"
              placeholder="0.00"
              value={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
              onChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
            />
            </div>
            <div className='py-4'>
            <label className="text-sm mt-2 block font-bold">เลขอ้างอิงบัตรเครดิต:</label>
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
              <div className="flex justify-between text-blue-700">
                <span className='font-bold'>ยอดสุทธิที่ต้องชำระ:</span>
                <span className='text-blue-600'>  {totalToPay.toLocaleString()} ฿ </span>
              </div>
              <hr />

              <div className="flex justify-between">
                <span className='font-bold text-green-700'>เงินสด:</span>
                <span className='text-green-600'> {cashAmount.toLocaleString()} ฿ </span>
              </div>

              <div className="flex justify-between">
                <span className='font-bold text-red-700'>เงินทอน:</span>
                <span className='text-red-600'> {safeChangeAmount.toLocaleString()} ฿ </span>
              </div>
              <hr />

              <div className="flex justify-between">
                <span className='font-bold text-cyan-700'>เงินโอน:</span>
                <span className='font-bold text-cyan-600'> {transferAmount.toLocaleString()} ฿ </span>
              </div>

              <div className="flex justify-between">
                <span className='font-bold text-amber-700'>บัตรเครดิต:</span>
                <span className='font-bold text-amber-500'> {creditAmount.toLocaleString()} ฿ </span>
              </div>
              <hr />
              <br />

              <div className="flex justify-between font-semibold text-base">
                <span className='font-bold'>รวมยอดทั้งหมด:</span>
                <span className={totalPaid >= safeFinalPrice ? 'text-green-600' : 'text-red-600'}>
                  {totalPaid.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
                </span>
              </div>

              {console.log('totalPaid :',totalPaid)}
              {console.log('safeFinalPrice :',safeFinalPrice)}
              <div                            
                className={`mt-2 p-2 rounded text-center font-semibold
                ${totalPaid >= safeFinalPrice ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {totalPaid >= safeFinalPrice ? '✅ ยอดชำระตรงกับยอดขาย' : '❌ ยอดชำระไม่ครบหรือข้อมูลผิดพลาด'}
              </div>
            </div>
           

            <div className="text-center pt-4 mt-auto">
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
