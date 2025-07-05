import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // Import Thai locale for dayjs if needed
dayjs.locale('th'); // Set locale globally or per instance

import useSupplierPaymentStore from '../store/supplierPaymentStore';
import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import ReceiptSelectionTable from './ReceiptSelectionTable';

const SupplierPaymentForm = ({ supplier }) => {
  const navigate = useNavigate();
  const { createSupplierPaymentAction } = useSupplierPaymentStore();
  const {
    loadReceiptsReadyToPayAction,
    receiptsReadyToPay, // This will be used for auto-selection
  } = usePurchaseOrderReceiptStore();

  const [formData, setFormData] = useState({
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: '0.00', // Initialize with formatted string
    method: 'CASH',
    paymentType: 'PO_BASED',
    note: '',
    receipts: [], // Stores { receiptId, amountPaid }
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Effect to clear receipts when payment type changes to PO_BASED
  useEffect(() => {
    if (formData.paymentType === 'PO_BASED') {
      setFormData((prev) => ({ ...prev, receipts: [] }));
    }
  }, [formData.paymentType, setFormData]);

  // Effect to automatically select receipts based on entered amount
  useEffect(() => {
    if (formData.paymentType === 'PO_BASED') {
      const desiredAmount = parseFloat(formData.amount.replace(/,/g, ''));
      if (isNaN(desiredAmount) || desiredAmount <= 0) {
        setFormData(prev => ({ ...prev, receipts: [] }));
        return;
      }

      let currentSum = 0;
      const newSelectedReceipts = [];

      // Sort receipts by receivedDate (oldest first) for consistent selection
      const sortedReceipts = [...receiptsReadyToPay].sort((a, b) =>
          dayjs(a.receivedDate).diff(dayjs(b.receivedDate))
      );

      for (const receipt of sortedReceipts) {
          const remaining = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
          if (remaining <= 0) continue; // Skip fully paid receipts

          if (currentSum + remaining <= desiredAmount) {
              // Take the whole receipt
              newSelectedReceipts.push({ receiptId: receipt.id, amountPaid: remaining });
              currentSum += remaining;
          } else {
              // Take a partial amount from this receipt
              const amountToPay = desiredAmount - currentSum;
              if (amountToPay > 0) {
                  newSelectedReceipts.push({ receiptId: receipt.id, amountPaid: amountToPay });
                  currentSum += amountToPay;
              }
              break; // Desired amount reached or exceeded
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
    const rawValue = e.target.value.replace(/,/g, ''); // Remove commas for parsing
    if (!isNaN(rawValue) || rawValue === '') {
        setFormData({ ...formData, amount: rawValue });
    }
  };

  const handleAmountBlur = (e) => {
    const value = parseFloat(e.target.value.replace(/,/g, ''));
    if (!isNaN(value)) {
        setFormData({ ...formData, amount: value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) });
    } else {
        setFormData({ ...formData, amount: '0.00' }); // Reset to 0.00 if invalid
    }
  };

  // Handles toggling a receipt's selection and setting default amountPaid
  const handleCheckboxChange = (receipt) => {
    setFormData(prevFormData => {
      const exists = prevFormData.receipts.find((r) => r.receiptId === receipt.id);
      let updatedReceipts;
      const remainingAmount = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);

      if (exists) {
        // If exists, remove it from the selected list
        updatedReceipts = prevFormData.receipts.filter((r) => r.receiptId !== receipt.id);
      } else {
        // If not exists, add it with the remaining outstanding amount as default
        updatedReceipts = [...prevFormData.receipts, { receiptId: receipt.id, amountPaid: remainingAmount }];
      }

      // Recalculate the main amount based on the sum of selected receipts
      const newTotal = updatedReceipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
      return {
        ...prevFormData,
        receipts: updatedReceipts,
        amount: newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      };
    });
  };

  // Handles changes to the "ยอดที่ต้องการจ่าย" input for a specific receipt
  const handleReceiptAmountPaidChange = (receiptId, value) => {
    setFormData(prevFormData => {
      const rawValue = value.replace(/,/g, '');
      const parsedValue = isNaN(rawValue) || rawValue === '' ? 0 : parseFloat(rawValue);

      const updatedReceipts = prevFormData.receipts.map(r =>
        r.receiptId === receiptId ? { ...r, amountPaid: parsedValue } : r
      );

      // Recalculate the main amount based on the sum of updated receipts
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
      supplierId: supplier.id,
      paymentDate: formData.paymentDate,
      amount: parsedAmount,
      method: formData.method,
      paymentType: formData.paymentType,
      note: formData.note,
      receipts: formData.paymentType === 'PO_BASED' ? formData.receipts : [],
      debitAmount: formData.paymentType === 'ADVANCE' ? parsedAmount : 0,
    };

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

  const isAdvance = formData.paymentType === 'ADVANCE';

  const handleSearchReceipts = (startDate, endDate, limit) => {
    const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
    const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');

    loadReceiptsReadyToPayAction({
      supplierId: supplier.id,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      limit,
    });
  };

  // Calculate the total amount of selected receipts for display in ReceiptSelectionTable
  const calculatedReceiptsTotal = formData.receipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Date Input */}
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
                เมื่อกรอกจำนวนเงิน ระบบจะเลือกใบรับของให้อัตโนมัติ หรือเลือกและกรอกเองในตารางด้านล่าง
              </p>
          )}
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

        {/* Payment Type Radio Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทการชำระเงิน</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="PO_BASED"
                checked={formData.paymentType === 'PO_BASED'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              ตามใบรับของ (Receipt)
            </label>
            <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="ADVANCE"
                checked={formData.paymentType === 'ADVANCE'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              ชำระล่วงหน้า
            </label>
            <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="paymentType"
                value="CREDIT_NOTE"
                checked={formData.paymentType === 'CREDIT_NOTE'}
                onChange={handleChange}
                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              เครดิตโน้ต
            </label>
          </div>
          {isAdvance && (
            <div className="text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg mt-3 text-sm">
              <p className="font-semibold">ข้อควรทราบ:</p>
              <p>การชำระล่วงหน้าจะไม่หักเครดิต จนกว่าจะมีการรับสินค้าเข้าสต๊อกจริง</p>
            </div>
          )}
        </div>

        {/* Conditionally render ReceiptSelectionTable */}
        {formData.paymentType === 'PO_BASED' && (
          <ReceiptSelectionTable
            receipts={receiptsReadyToPay}
            selectedReceipts={formData.receipts}
            onToggle={handleCheckboxChange}
            onAmountPaidChange={handleReceiptAmountPaidChange} // Pass new handler
            totalAmount={calculatedReceiptsTotal} // Pass the calculated total from selected receipts
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
            rows="4"
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

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            บันทึกการชำระเงิน
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierPaymentForm;
