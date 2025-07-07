import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');

import useSupplierPaymentStore from '../store/supplierPaymentStore';
import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import ReceiptSelectionTable from './ReceiptSelectionTable';

const SupplierPaymentForm = ({ supplier, supplierId: overrideSupplierId }) => {
  const navigate = useNavigate();
  const supplierId = overrideSupplierId || supplier?.id;
  const { createSupplierPaymentAction } = useSupplierPaymentStore();
  const {
    loadReceiptsReadyToPayAction,
    receiptsReadyToPay,
  } = usePurchaseOrderReceiptStore();

  const [formData, setFormData] = useState({
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: '0.00',
    method: 'CASH',
    paymentType: 'PO_BASED',
    note: '',
    receipts: [],
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (formData.paymentType !== 'PO_BASED') {
      setFormData((prev) => ({ ...prev, receipts: [] }));
    }
  }, [formData.paymentType, setFormData]);

  useEffect(() => {
    if (formData.paymentType === 'PO_BASED') {
      const totalOutstanding = receiptsReadyToPay.reduce((sum, receipt) => {
        const remaining = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
        return sum + Math.max(0, remaining);
      }, 0);
      setFormData(prev => ({
        ...prev,
        amount: totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      }));
    }
  }, [receiptsReadyToPay, formData.paymentType, setFormData]);

  useEffect(() => {
    if (formData.paymentType === 'PO_BASED') {
      const desiredAmount = parseFloat(formData.amount.replace(/,/g, ''));
      if (isNaN(desiredAmount) || desiredAmount <= 0) {
        setFormData(prev => ({ ...prev, receipts: [] }));
        return;
      }

      let currentSum = 0;
      const newSelectedReceipts = [];
      const sortedReceipts = [...receiptsReadyToPay].sort((a, b) =>
        dayjs(a.receivedDate).diff(dayjs(b.receivedDate))
      );

      for (const receipt of sortedReceipts) {
        const remaining = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
        if (remaining <= 0) continue;

        if (currentSum + remaining <= desiredAmount) {
          newSelectedReceipts.push({ receiptId: receipt.id, amountPaid: remaining });
          currentSum += remaining;
        } else {
          const amountToPay = desiredAmount - currentSum;
          if (amountToPay > 0) {
            newSelectedReceipts.push({ receiptId: receipt.id, amountPaid: amountToPay });
            currentSum += amountToPay;
          }
          break;
        }
      }
      setFormData(prev => ({ ...prev, receipts: newSelectedReceipts }));
    }
  }, [formData.amount, formData.paymentType, receiptsReadyToPay, setFormData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      setFormData({ ...formData, amount: '0.00' });
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
        amount: newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      };
    });
  };

  const handleReceiptAmountPaidChange = (receiptId, value) => {
    setFormData(prevFormData => {
      // Ensure value is treated as a string before replace()
      const rawValue = String(value).replace(/,/g, '');
      const parsedValue = isNaN(rawValue) || rawValue === '' ? 0 : parseFloat(rawValue);

      const updatedReceipts = prevFormData.receipts.map(r =>
        r.receiptId === receiptId ? { ...r, amountPaid: parsedValue } : r
      );

      const newTotal = updatedReceipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

      return {
        ...prevFormData,
        receipts: updatedReceipts,
        amount: newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

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
      receiptItems: formData.paymentType === 'PO_BASED'
        ? formData.receipts.map(r => ({ receiptId: r.receiptId, amountPaid: r.amountPaid }))
        : []
    };

    console.log('📦 Payload ก่อนส่ง:', JSON.stringify(payload, null, 2));

    try {
      await createSupplierPaymentAction(payload);
      setSuccessMessage('บันทึกการชำระเงินสำเร็จ!');
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + (err.message || 'Unknown error'));
    }
  };


  const handleSearchReceipts = (startDate, endDate, limit) => {
    const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
    const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');

    loadReceiptsReadyToPayAction({
      supplierId: supplierId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      limit,
    });
  };

  const selectedReceiptsTotal = formData.receipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

  const totalOutstandingAmount = receiptsReadyToPay.reduce((sum, receipt) => {
    const remaining = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
    return sum + Math.max(0, remaining);
  }, 0);

  // Logic for disabling the submit button
  const parsedAmountForValidation = parseFloat(formData.amount.replace(/,/g, ''));
  const isAmountMismatch = formData.paymentType === 'PO_BASED' &&
                           Math.abs(parsedAmountForValidation - selectedReceiptsTotal) > 0.01;

  const isSubmitButtonDisabled =
    isNaN(parsedAmountForValidation) ||
    parsedAmountForValidation <= 0 ||
    error !== null ||
    isAmountMismatch; // Use the new mismatch flag here

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Date Input */}

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">วันที่ชำระ</label>
            <div className="relative">
              <input
                type="date"
                id="paymentDate"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out pr-10"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                📅
              </span>
            </div>
          </div>

          {/* Payment Method Select */}
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">วิธีชำระเงิน</label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              <option value="CASH">เงินสด</option>
              <option value="TRANSFER">โอนเงิน</option>
              <option value="CHEQUE">เช็ค</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน</label>
            <input
              type="text" // Changed to text to allow formatted input
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 transition duration-150 ease-in-out"
              placeholder="0.00"
            // Not disabled anymore, allowing user to input amount for auto-selection
            />
            {formData.paymentType === 'PO_BASED' && (
              <p className="mt-1 text-sm text-gray-500">
                เมื่อกรอกจำนวนเงิน ระบบจะเลือกบิลให้อัตโนมัติ หรือเลือกและกรอกเองในตารางด้านล่าง
              </p>
            )}
          </div>



        </div>


        {/* Conditionally render ReceiptSelectionTable */}
        {formData.paymentType === 'PO_BASED' && (
          <ReceiptSelectionTable
            supplierId={supplierId}
            receipts={receiptsReadyToPay}
            selectedReceipts={formData.receipts}
            onToggle={handleCheckboxChange}
            onAmountPaidChange={handleReceiptAmountPaidChange} // Pass new handler
            selectedReceiptsTotal={selectedReceiptsTotal} // Pass the calculated total from selected receipts
            totalOutstandingAmount={totalOutstandingAmount} // Pass total outstanding for all displayed receipts
            onSearch={handleSearchReceipts}            

            
          />
        )}

        {/* Note/Remarks Textarea */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ถ้ามี)</label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
            rows="2"
            placeholder="เพิ่มหมายเหตุเกี่ยวกับการชำระเงิน"
          />
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">ข้อผิดพลาด!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative" role="alert">
            <strong className="font-bold">สำเร็จ!</strong>
            <span className="block sm:inline ml-2">{successMessage}</span>
          </div>
        )}

        {/* Warning message for amount mismatch */}
        {formData.paymentType === 'PO_BASED' && isAmountMismatch && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg relative text-center" role="alert">
            <strong className="font-bold">คำเตือน!</strong>
            <span className="block sm:inline ml-2">กรุณาใส่ยอดเงินให้ตรงกับ รวมยอดที่เลือกชำระ</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitButtonDisabled} // Apply the disabled logic here
          >
            บันทึกการชำระเงิน
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierPaymentForm;

