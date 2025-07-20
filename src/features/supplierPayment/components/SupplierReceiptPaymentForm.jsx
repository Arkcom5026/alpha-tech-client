import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');

import useSupplierPaymentStore from '../store/supplierPaymentStore';
import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import ReceiptSelectionTable from './SupplierReceiptSelectionTable';

// --- ✅ NEW Sub-component for Amount Input ---
/**
 * Component: PaymentMethodInput
 * วัตถุประสงค์: เป็น Input ที่ออกแบบมาสำหรับการกรอกจำนวนเงินโดยเฉพาะ
 * ทำให้ UI มีความสอดคล้องและสวยงาม
 */
const PaymentMethodInput = ({ label, value, onChange, onBlur }) => {
  return (
    <div>
      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        id="amount"
        name="amount"
        type="text"
        className="w-full h-[42px] border-gray-300 rounded-md px-3 py-2 text-xl text-right font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
        placeholder="0.00"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
};


// --- Main Component ---
const SupplierReceiptPaymentForm = ({ supplier, supplierId: overrideSupplierId }) => {
  const navigate = useNavigate();
  const supplierId = overrideSupplierId || supplier?.id;
  const { createSupplierPaymentAction } = useSupplierPaymentStore();
  const {
    loadReceiptsReadyToPayAction,
    receiptsReadyToPay,
    isLoading: isReceiptsLoading,
  } = usePurchaseOrderReceiptStore();

  const [formData, setFormData] = useState({
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: '', // ✅ FIX: Changed initial amount to an empty string
    method: 'CASH',
    paymentType: 'RECEIPT_BASED',
    note: '',
    receipts: [],
    chequeDetails: {
      number: '',
      bank: '',
      dueDate: '',
    },
  });

  const [error, setError] = useState(null);
  const [successPayload, setSuccessPayload] = useState(null);

  const handleSearchReceipts = useCallback((startDate, endDate, limit) => {
    const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
    const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');
    loadReceiptsReadyToPayAction({
      supplierId: supplierId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      limit,
    });
  }, [supplierId, loadReceiptsReadyToPayAction]);


  useEffect(() => {
    if (formData.paymentType === 'RECEIPT_BASED') {
      const desiredAmount = parseFloat(formData.amount.replace(/,/g, ''));
      if (isNaN(desiredAmount) || desiredAmount <= 0) {
        setFormData(prev => ({ ...prev, receipts: [] }));
        return;
      }

      let currentSum = 0;
      const newSelectedReceipts = [];

      const sortedReceipts = [...receiptsReadyToPay].sort((a, b) =>
        new Date(a.receivedDate) - new Date(b.receivedDate)
      );

      for (const receipt of sortedReceipts) {
        const total = Number(receipt.totalAmount || 0);
        const paid = Number(receipt.paidAmount || 0);
        const remaining = Math.max(0, total - paid);
        if (remaining <= 0) continue;

        const canUse = Math.min(remaining, desiredAmount - currentSum);
        if (canUse > 0) {
          newSelectedReceipts.push({ receiptId: receipt.id, amountPaid: canUse });
          currentSum += canUse;
        }

        if (currentSum >= desiredAmount) break;
      }

      setFormData(prev => ({ ...prev, receipts: newSelectedReceipts }));
    }
  }, [formData.amount, formData.paymentType, receiptsReadyToPay]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('chequeDetails.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        chequeDetails: { ...prev.chequeDetails, [key]: value }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '') {
      setFormData({ ...formData, amount: rawValue });
    }
  };

  const handleAmountBlur = (e) => {
    const value = parseFloat(e.target.value.replace(/,/g, ''));
    if (!isNaN(value)) {
      setFormData({ ...formData, amount: value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
    } else {
      setFormData({ ...formData, amount: '' }); // ✅ FIX: Set to empty string on blur if invalid
    }
  };

  const handleCheckboxChange = (receipt) => {
    setFormData(prevFormData => {
      const exists = prevFormData.receipts.find((r) => r.receiptId === receipt.id);
      let updatedReceipts;
      const remainingAmount = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);

      if (exists) {
        updatedReceipts = prevFormData.receipts.filter((r) => r.receiptId !== receipt.id);
      } else {
        updatedReceipts = [...prevFormData.receipts, { receiptId: receipt.id, amountPaid: remainingAmount }];
      }

      const newTotal = updatedReceipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
      return {
        ...prevFormData,
        receipts: updatedReceipts,
        amount: newTotal > 0 ? newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
      };
    });
  };

  const handleReceiptAmountPaidChange = (receiptId, value) => {
    setFormData(prevFormData => {
      const rawValue = String(value).replace(/,/g, '');
      const parsedValue = isNaN(rawValue) || rawValue === '' ? 0 : parseFloat(rawValue);
      const updatedReceipts = prevFormData.receipts.map(r =>
        r.receiptId === receiptId ? { ...r, amountPaid: parsedValue } : r
      );
      const newTotal = updatedReceipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
      return {
        ...prevFormData,
        receipts: updatedReceipts,
        amount: newTotal > 0 ? newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessPayload(null);

    const parsedAmount = parseFloat(formData.amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่าศูนย์');
    }

    const payload = {
      supplierId: supplierId,
      paymentDate: formData.paymentDate,
      amount: parsedAmount,
      method: formData.method,
      paymentType: formData.paymentType,
      note: formData.note,
      debitAmount: formData.paymentType === 'ADVANCE' ? parsedAmount : 0,
      receiptItems: formData.paymentType === 'RECEIPT_BASED'
        ? formData.receipts.map(r => ({ receiptId: r.receiptId, amountPaid: r.amountPaid }))
        : [],
      ...(formData.method === 'CHEQUE' && { chequeDetails: formData.chequeDetails }),
    };

    try {
      const response = await createSupplierPaymentAction(payload);
      setSuccessPayload(response);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (err.message || 'Unknown error'));
    }
  };

  const handlePrintVoucher = () => {
    alert(`กำลังพิมพ์ใบสำคัญจ่ายสำหรับรายการ: ${successPayload.id}`);
    navigate(-1);
  };


  const selectedReceiptsTotal = formData.receipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
  const totalOutstandingAmount = receiptsReadyToPay.reduce((sum, receipt) => {
    const remaining = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
    return sum + Math.max(0, remaining);
  }, 0);

  const parsedAmountForValidation = parseFloat(formData.amount.replace(/,/g, ''));
  const isAmountMismatch = formData.paymentType === 'RECEIPT_BASED' &&
    Math.abs(parsedAmountForValidation - selectedReceiptsTotal) > 0.01;
  const isSubmitButtonDisabled = isNaN(parsedAmountForValidation) || parsedAmountForValidation <= 0 || error !== null || isAmountMismatch;

  if (successPayload) {
    return (
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-lg shadow-md text-center" role="alert">
        <strong className="font-bold text-xl block">บันทึกการชำระเงินสำเร็จ!</strong>
        <p className="mt-2">ยอดชำระจำนวน {successPayload.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท ได้ถูกบันทึกเรียบร้อย</p>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={() => navigate(-1)} className="bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-600">
            กลับไปที่รายการ
          </button>
          <button onClick={handlePrintVoucher} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700">
            พิมพ์ใบสำคัญจ่าย
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่ชำระ</label>
            <input type="date"
              id="paymentDate"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm h-[42px] px-3" />
          </div>
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">วิธีชำระเงิน</label>
            <select id="method" name="method" value={formData.method} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm h-[42px]">
              <option value="CASH">เงินสด</option>
              <option value="TRANSFER">โอนเงิน</option>
              <option value="CHEQUE">เช็ค</option>
            </select>
          </div>
          <div>
            {/* ✅ Replaced the old input with the new PaymentMethodInput component */}
            <PaymentMethodInput
              label="จำนวนเงิน"
              value={formData.amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
            />
          </div>
        </div>

        {formData.method === 'CHEQUE' && (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เลขที่เช็ค</label>
              <input type="text" name="chequeDetails.number" value={formData.chequeDetails.number} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ธนาคาร</label>
              <input type="text" name="chequeDetails.bank" value={formData.chequeDetails.bank} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่บนเช็ค</label>
              <input type="date" name="chequeDetails.dueDate" value={formData.chequeDetails.dueDate} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
        )}

        {formData.paymentType === 'RECEIPT_BASED' && (
          <ReceiptSelectionTable
            supplierId={supplierId}
            receipts={receiptsReadyToPay}
            isLoading={isReceiptsLoading}
            selectedReceipts={formData.receipts}
            onToggle={handleCheckboxChange}
            onAmountPaidChange={handleReceiptAmountPaidChange}
            selectedReceiptsTotal={selectedReceiptsTotal}
            totalOutstandingAmount={totalOutstandingAmount}
            onSearch={handleSearchReceipts}
          />
        )}

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ถ้ามี)</label>
          <textarea id="note" name="note" value={formData.note} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" rows="2" />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            {error}
          </div>
        )}
        {isAmountMismatch && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg text-center" role="alert">
            ยอดเงินรวมไม่ตรงกับยอดที่เลือกในตาราง
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400" disabled={isSubmitButtonDisabled}>
            บันทึกการชำระเงิน
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierReceiptPaymentForm;
