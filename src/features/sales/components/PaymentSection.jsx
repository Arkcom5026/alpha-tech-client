import React, { useState } from 'react';
import useSalesStore from '@/features/sales/store/salesStore';
import useCustomerStore from '@/features/customer/store/customerStore';

const PaymentSection = () => {
  const {
    totalPrice,
    billDiscount,
    setBillDiscount,
    setPaymentAmount,
    paymentList,
    confirmSaleOrderAction,
    saleItems,
    cardRef,
    setCardRef,
    sumPaymentList
  } = useSalesStore();
  const { customer } = useCustomerStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalOriginalPrice = Array.isArray(saleItems)
    ? saleItems.reduce((sum, item) => sum + (item.price || 0), 0)
    : 0;
  const totalDiscountOnly = Array.isArray(saleItems)
    ? saleItems.reduce((sum, item) => sum + (item.discount || 0), 0)
    : 0;
  const safeBillDiscount = typeof billDiscount === 'number' && !isNaN(billDiscount) ? billDiscount : 0;
  const totalDiscount = totalDiscountOnly + safeBillDiscount;
  const totalPriceAfterDiscount = totalOriginalPrice - totalDiscount;
  const safeFinalPrice = totalPriceAfterDiscount;
  const priceBeforeVat = safeFinalPrice / 1.07;
  const vatAmount = safeFinalPrice - priceBeforeVat;
  const safeSumPayment = typeof sumPaymentList === 'function' ? sumPaymentList() : 0;

  const totalToPay = safeFinalPrice;
  const cashAmount = Number(paymentList.find(p => p.method === 'CASH')?.amount || 0);
  const transferAmount = Number(paymentList.find(p => p.method === 'TRANSFER')?.amount || 0);
  const creditAmount = Number(paymentList.find(p => p.method === 'CREDIT')?.amount || 0);
  const totalPaid = paymentList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const paidByOther = totalPaid - cashAmount;
  const remainingToPay = Math.max(totalToPay - paidByOther, 0);
  const safeChangeAmount = Math.max(cashAmount - remainingToPay, 0);
  const totalPaidNet = totalPaid - safeChangeAmount;

  const handleConfirm = async () => {
    if (!customer?.id || !saleItems.length || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await confirmSaleOrderAction();
    } catch (err) {
      console.error('❌ ยืนยันการขายล้มเหลว:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmEnabled = safeSumPayment >= safeFinalPrice && customer?.id && saleItems.length;

  const handleBillDiscountChange = (e) => {
    const newDiscount = Number(e.target.value) || 0;
    if (newDiscount <= totalOriginalPrice) {
      setBillDiscount(newDiscount);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow min-w-[850px] flex flex-col-4 justify-center gap-4">

      {/* รายละเอียด */}
      <div className="mb-2 bg-slate-100 min-w-[250px] p-4 rounded-md space-y-1">
        <h2 className="text-lg font-semibold mb-2">รายละเอียด</h2>
        <hr />
        <div className="flex justify-between">
          <span>ยอดรวมราคาสินค้า:</span>
          <span>{totalOriginalPrice.toLocaleString()} ฿</span>
        </div>
        <div className="flex justify-between">
          <span>ส่วนลดต่อรายการ:</span>
          <span className="text-orange-500">{totalDiscountOnly.toLocaleString()} ฿</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span>ส่วนลดท้ายบิล:</span>
          <input
            type="number"
            value={safeBillDiscount}
            onChange={handleBillDiscountChange}
            className={`w-24 px-2 py-1 text-right border rounded ${
              safeBillDiscount > totalOriginalPrice ? 'border-red-500 text-red-600' : ''
            }`}
          />
        </div>
        {safeBillDiscount > totalOriginalPrice && (
          <div className="text-red-600 text-sm mt-1 text-right">
            ⚠️ ส่วนลดท้ายบิลห้ามเกินยอดรวมสินค้า ({totalOriginalPrice.toLocaleString()} ฿)
          </div>
        )}
        <div className="flex justify-between">
          <span>รวมส่วนลดทั้งหมด:</span>
          <span className="text-orange-700">🧾 {totalDiscount.toLocaleString()} ฿</span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span>ยอดก่อนภาษี (Net):</span>
          <span>{priceBeforeVat.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
        </div>
        <div className="flex justify-between">
          <span>Vat 7%:</span>
          <span className="text-red-600">{vatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿</span>
        </div>
        <br />
        <hr />
        <div className="text-xl font-bold text-green-700 text-right pt-2">
          ยอดที่ต้องชำระ: {safeFinalPrice.toLocaleString()} ฿
        </div>
        <hr />

    
      </div>




      {/* เงินสด */}
      <div className="mb-4 min-w-[250px] bg-green-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">เงินสด</h2>
        <hr />
        <div className="grid grid-cols-1 gap-3 items-end">
          <div>
            <label className="block text-sm font-bold text-gray-700  ">ยอดที่รับ (เงินสด):</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-4 py-2"
              placeholder="0.00"
              value={paymentList.find(p => p.method === 'CASH')?.amount || ''}
              onChange={(e) => setPaymentAmount('CASH', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">เงินทอน:</label>
            <div className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 text-right">
              {safeChangeAmount.toLocaleString()} ฿
            </div>
          </div>
          <div className="text-sm text-gray-700 font-bold">
            ต้องรับเงินสดอย่างน้อย: {remainingToPay.toLocaleString()} ฿
          </div>
        </div>
      </div>

      {/* เงินโอน */}
      <div className="mb-4 min-w-[250px] bg-sky-200 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2 ">เงินโอน</h2>
        <hr />
      
        <label className="block text-sm font-bold text-gray-700 ">ยอดรวมเงินโอน:</label>
        <input
          type="number"
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="0.00"
          value={paymentList.find(p => p.method === 'TRANSFER')?.amount || ''}
          onChange={(e) => setPaymentAmount('TRANSFER', e.target.value)}
        />
      </div>

      {/* บัตรเครดิต */}
      <div className="mb-4 min-w-[250px] bg-yellow-100 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">บัตรเครดิต</h2>
        <hr />
        <label className="block text-sm font-bold text-gray-700">ยอดบัตรเครดิต:</label>
        <input
          type="number"
          className="mt-1 w-full border rounded px-3 py-2"
          placeholder="0.00"
          value={paymentList.find(p => p.method === 'CREDIT')?.amount || ''}
          onChange={(e) => setPaymentAmount('CREDIT', e.target.value)}
        />
        <label className="text-sm mt-2 block font-bold">เลขอ้างอิงบัตรเครดิต:</label>
        <input
          type="text"
          value={cardRef}
          onChange={(e) => setCardRef(e.target.value)}
          className="border rounded p-1 w-full mt-1"
          placeholder="กรอกเลขอ้างอิงจากเครื่องรูดบัตร"
          maxLength={24}
        />
      </div>

      {/* สรุปยอด + ปุ่มยืนยัน */}
      <div className="mb-4 min-w-[250px] bg-lime-100 p-3 rounded flex flex-col justify-between h-full">
        <div>
          <h2 className="text-lg font-semibold mb-2">สรุปยอด</h2>
          <hr />
          <div className="text-sm text-gray-700 mt-2">
            <div className="flex justify-between">
              <span className='font-bold'>ยอดสุทธิที่ต้องชำระ:</span>
              <span className='text-blue-600'>  {safeFinalPrice.toLocaleString()} ฿ </span>
            </div>
            <hr />

            <div className="flex justify-between">
              <span className='font-bold'>เงินสด:</span>
              <span className='text-green-600'> {cashAmount.toLocaleString()} ฿ </span>
            </div>

            <div className="flex justify-between">
              <span className='font-bold'>เงินทอน:</span>
              <span className='text-red-600'> {safeChangeAmount.toLocaleString()} ฿ </span>
            </div>
            <hr />

            <div className="flex justify-between">
              <span className='font-bold'>เงินโอน:</span>              
              <span> {transferAmount.toLocaleString()} ฿ </span>
            </div>

            <div className="flex justify-between">
              <span className='font-bold'>บัตรเครดิต:</span>
              <span> {creditAmount.toLocaleString()} ฿ </span>
            </div>
            <hr />
            <br />

            <div className="flex justify-between font-semibold text-base">
              <span className='font-bold'>รวมยอดทั้งหมด:</span>
              <span className={totalPaidNet === safeFinalPrice ? 'text-green-600' : 'text-red-600'}>
                {totalPaidNet.toLocaleString(undefined, { maximumFractionDigits: 2 })} ฿
              </span>
            </div>

            <div
              className={`mt-2 p-2 rounded text-center font-semibold
                ${totalPaidNet === safeFinalPrice ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
            >
              {totalPaidNet === safeFinalPrice
                ? '✅ ยอดชำระตรงกับยอดขาย'
                : '⚠️ ยอดชำระไม่ตรงกับยอดขาย กรุณาตรวจสอบช่องทางการชำระ'}
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
  );
};

export default PaymentSection;
