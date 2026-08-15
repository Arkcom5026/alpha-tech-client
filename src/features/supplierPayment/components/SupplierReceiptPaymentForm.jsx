import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { feedback } from '@/design-system/feedback';
import useSupplierPaymentStore from '../store/supplierPaymentStore';
import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import ReceiptSelectionTable from './SupplierReceiptSelectionTable';

dayjs.locale('th');

const PaymentMethodInput = ({ label, value, onChange, onBlur }) => (
  <div>
    <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input
      id="amount"
      name="amount"
      type="text"
      className="h-[42px] w-full rounded-md border-gray-300 px-3 py-2 text-right text-xl font-bold text-emerald-700 shadow-sm focus:ring-2 focus:ring-emerald-500"
      placeholder="0.00"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  </div>
);

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
    amount: '',
    method: 'CASH',
    paymentType: 'RECEIPT_BASED',
    note: '',
    receipts: [],
    chequeDetails: { number: '', bank: '', dueDate: '' },
  });
  const [error, setError] = useState(null);
  const [successPayload, setSuccessPayload] = useState(null);

  const handleSearchReceipts = useCallback((startDate, endDate, limit) => {
    const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
    const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');
    loadReceiptsReadyToPayAction({
      supplierId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      limit,
    });
  }, [supplierId, loadReceiptsReadyToPayAction]);

  useEffect(() => {
    if (formData.paymentType !== 'RECEIPT_BASED') return;

    const desiredAmount = parseFloat(formData.amount.replace(/,/g, ''));
    if (Number.isNaN(desiredAmount) || desiredAmount <= 0) {
      setFormData((prev) => ({ ...prev, receipts: [] }));
      return;
    }

    let currentSum = 0;
    const newSelectedReceipts = [];
    const sortedReceipts = [...receiptsReadyToPay].sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));

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

    setFormData((prev) => ({ ...prev, receipts: newSelectedReceipts }));
  }, [formData.amount, formData.paymentType, receiptsReadyToPay]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('chequeDetails.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({ ...prev, chequeDetails: { ...prev.chequeDetails, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!Number.isNaN(Number(rawValue)) || rawValue === '') {
      setFormData((prev) => ({ ...prev, amount: rawValue }));
    }
  };

  const handleAmountBlur = (e) => {
    const value = parseFloat(e.target.value.replace(/,/g, ''));
    setFormData((prev) => ({
      ...prev,
      amount: !Number.isNaN(value)
        ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '',
    }));
  };

  const handleCheckboxChange = (receipt) => {
    setFormData((prevFormData) => {
      const exists = prevFormData.receipts.find((r) => r.receiptId === receipt.id);
      const remainingAmount = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
      const updatedReceipts = exists
        ? prevFormData.receipts.filter((r) => r.receiptId !== receipt.id)
        : [...prevFormData.receipts, { receiptId: receipt.id, amountPaid: remainingAmount }];
      const newTotal = updatedReceipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
      return {
        ...prevFormData,
        receipts: updatedReceipts,
        amount: newTotal > 0 ? newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '',
      };
    });
  };

  const handleReceiptAmountPaidChange = (receiptId, value) => {
    setFormData((prevFormData) => {
      const rawValue = String(value).replace(/,/g, '');
      const parsedValue = Number.isNaN(Number(rawValue)) || rawValue === '' ? 0 : parseFloat(rawValue);
      const updatedReceipts = prevFormData.receipts.map((r) => r.receiptId === receiptId ? { ...r, amountPaid: parsedValue } : r);
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
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินให้ถูกต้องและมากกว่าศูนย์');
      return;
    }

    const payload = {
      supplierId,
      paymentDate: formData.paymentDate,
      amount: parsedAmount,
      method: formData.method,
      paymentType: formData.paymentType,
      note: formData.note,
      debitAmount: formData.paymentType === 'ADVANCE' ? parsedAmount : 0,
      receiptItems: formData.paymentType === 'RECEIPT_BASED'
        ? formData.receipts.map((r) => ({ receiptId: r.receiptId, amountPaid: r.amountPaid }))
        : [],
      ...(formData.method === 'CHEQUE' && { chequeDetails: formData.chequeDetails }),
    };

    try {
      const response = await createSupplierPaymentAction(payload);
      setSuccessPayload(response);
    } catch (err) {
      setError(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${err.message || 'Unknown error'}`);
    }
  };

  const handlePrintVoucher = () => {
    feedback.info(`กำลังพิมพ์ใบสำคัญจ่ายสำหรับรายการ: ${successPayload.id}`);
    navigate(-1);
  };

  const selectedReceiptsTotal = formData.receipts.reduce((sum, item) => sum + (item.amountPaid || 0), 0);
  const totalOutstandingAmount = receiptsReadyToPay.reduce((sum, receipt) => {
    const remaining = (receipt.totalAmount || 0) - (receipt.paidAmount || 0);
    return sum + Math.max(0, remaining);
  }, 0);
  const parsedAmountForValidation = parseFloat(formData.amount.replace(/,/g, ''));
  const isAmountMismatch = formData.paymentType === 'RECEIPT_BASED'
    && Math.abs(parsedAmountForValidation - selectedReceiptsTotal) > 0.01;
  const isSubmitButtonDisabled = Number.isNaN(parsedAmountForValidation)
    || parsedAmountForValidation <= 0
    || error !== null
    || isAmountMismatch;

  if (successPayload) {
    return (
      <div className="rounded-lg border-l-4 border-green-500 bg-green-100 p-6 text-center text-green-700 shadow-md" role="alert">
        <strong className="block text-xl font-bold">บันทึกการชำระเงินสำเร็จ!</strong>
        <p className="mt-2">ยอดชำระจำนวน {successPayload.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท ได้ถูกบันทึกเรียบร้อย</p>
        <div className="mt-6 flex justify-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600">กลับไปที่รายการ</button>
          <button onClick={handlePrintVoucher} className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700">พิมพ์ใบสำคัญจ่าย</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="paymentDate" className="mb-1 block text-sm font-medium text-gray-700">วันที่ชำระ</label>
            <input type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="h-[42px] w-full rounded-md border-gray-300 px-3 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label htmlFor="method" className="mb-1 block text-sm font-medium text-gray-700">วิธีชำระเงิน</label>
            <select id="method" name="method" value={formData.method} onChange={handleChange} className="h-[42px] w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
              <option value="CASH">เงินสด</option><option value="TRANSFER">โอนเงิน</option><option value="CHEQUE">เช็ค</option>
            </select>
          </div>
          <PaymentMethodInput label="จำนวนเงิน" value={formData.amount} onChange={handleAmountChange} onBlur={handleAmountBlur} />
        </div>

        {formData.method === 'CHEQUE' && (
          <div className="grid grid-cols-1 gap-6 rounded-lg border border-blue-200 bg-blue-50 p-4 md:grid-cols-3">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">เลขที่เช็ค</label><input type="text" name="chequeDetails.number" value={formData.chequeDetails.number} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">ธนาคาร</label><input type="text" name="chequeDetails.bank" value={formData.chequeDetails.bank} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">วันที่บนเช็ค</label><input type="date" name="chequeDetails.dueDate" value={formData.chequeDetails.dueDate} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div>
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

        <div><label htmlFor="note" className="mb-1 block text-sm font-medium text-gray-700">หมายเหตุ (ถ้ามี)</label><textarea id="note" name="note" value={formData.note} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" rows="2" /></div>

        {error && <div className="rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">{error}</div>}
        {isAmountMismatch && <div className="rounded-lg border border-yellow-400 bg-yellow-100 px-4 py-3 text-center text-yellow-700" role="alert">ยอดเงินรวมไม่ตรงกับยอดที่เลือกในตาราง</div>}

        <div className="flex justify-end pt-4">
          <button type="submit" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-400" disabled={isSubmitButtonDisabled}>บันทึกการชำระเงิน</button>
        </div>
      </form>
    </div>
  );
};

export default SupplierReceiptPaymentForm;