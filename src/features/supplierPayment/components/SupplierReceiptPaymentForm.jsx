import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { feedback } from '@/design-system/feedback';
import useSupplierPaymentStore from '../store/supplierPaymentStore';
import usePurchaseOrderReceiptStore from '../../purchaseOrderReceipt/store/purchaseOrderReceiptStore';
import ReceiptSelectionTable from './SupplierReceiptSelectionTable';

dayjs.locale('th');

const PaymentMethodInput = ({ label, value, onChange, onBlur, disabled }) => (
  <div>
    <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input id="amount" name="amount" type="text" disabled={disabled} className="h-[42px] w-full rounded-md border-gray-300 px-3 py-2 text-right text-xl font-bold text-emerald-700 shadow-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-60" placeholder="0.00" value={value} onChange={onChange} onBlur={onBlur} />
  </div>
);

const SupplierReceiptPaymentForm = ({ supplier, supplierId: overrideSupplierId }) => {
  const navigate = useNavigate();
  const supplierId = overrideSupplierId || supplier?.id;
  const { createSupplierPaymentAction } = useSupplierPaymentStore();
  const { loadReceiptsReadyToPayAction, receiptsReadyToPay, isLoading: isReceiptsLoading } = usePurchaseOrderReceiptStore();
  const [formData, setFormData] = useState({ paymentDate: dayjs().format('YYYY-MM-DD'), amount: '', method: 'CASH', paymentType: 'RECEIPT_BASED', note: '', receipts: [], chequeDetails: { number: '', bank: '', dueDate: '' } });
  const [error, setError] = useState(null);
  const [successPayload, setSuccessPayload] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearchReceipts = useCallback((startDate, endDate, limit) => {
    const formattedStartDate = dayjs(startDate).format('YYYY-MM-DD');
    const formattedEndDate = dayjs(endDate).format('YYYY-MM-DD');
    Promise.resolve(loadReceiptsReadyToPayAction({ supplierId, startDate: formattedStartDate, endDate: formattedEndDate, limit })).catch((requestError) => {
      feedback.actionError(requestError, 'โหลดใบรับสินค้าที่พร้อมชำระไม่สำเร็จ', 'supplier-payment:receipt:search:error');
    });
  }, [supplierId, loadReceiptsReadyToPayAction]);

  useEffect(() => {
    if (formData.paymentType !== 'RECEIPT_BASED') return;
    const desiredAmount = parseFloat(formData.amount.replace(/,/g, ''));
    if (Number.isNaN(desiredAmount) || desiredAmount <= 0) {
      setFormData((previous) => ({ ...previous, receipts: [] }));
      return;
    }
    let currentSum = 0;
    const selected = [];
    const sorted = [...receiptsReadyToPay].sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate));
    for (const receipt of sorted) {
      const remaining = Math.max(0, Number(receipt.totalAmount || 0) - Number(receipt.paidAmount || 0));
      if (remaining <= 0) continue;
      const canUse = Math.min(remaining, desiredAmount - currentSum);
      if (canUse > 0) {
        selected.push({ receiptId: receipt.id, amountPaid: canUse });
        currentSum += canUse;
      }
      if (currentSum >= desiredAmount) break;
    }
    setFormData((previous) => ({ ...previous, receipts: selected }));
  }, [formData.amount, formData.paymentType, receiptsReadyToPay]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('chequeDetails.')) {
      const key = name.split('.')[1];
      setFormData((previous) => ({ ...previous, chequeDetails: { ...previous.chequeDetails, [key]: value } }));
    } else setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleAmountChange = (event) => {
    const rawValue = event.target.value.replace(/,/g, '');
    if (!Number.isNaN(Number(rawValue)) || rawValue === '') setFormData((previous) => ({ ...previous, amount: rawValue }));
  };

  const handleAmountBlur = (event) => {
    const value = parseFloat(event.target.value.replace(/,/g, ''));
    setFormData((previous) => ({ ...previous, amount: !Number.isNaN(value) ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' }));
  };

  const handleCheckboxChange = (receipt) => {
    if (submitting) return;
    setFormData((previous) => {
      const exists = previous.receipts.find((row) => row.receiptId === receipt.id);
      const remainingAmount = Number(receipt.totalAmount || 0) - Number(receipt.paidAmount || 0);
      const updated = exists ? previous.receipts.filter((row) => row.receiptId !== receipt.id) : [...previous.receipts, { receiptId: receipt.id, amountPaid: remainingAmount }];
      const newTotal = updated.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0);
      return { ...previous, receipts: updated, amount: newTotal > 0 ? newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' };
    });
  };

  const handleReceiptAmountPaidChange = (receiptId, value) => {
    if (submitting) return;
    setFormData((previous) => {
      const rawValue = String(value).replace(/,/g, '');
      const parsedValue = Number.isNaN(Number(rawValue)) || rawValue === '' ? 0 : parseFloat(rawValue);
      const updated = previous.receipts.map((row) => row.receiptId === receiptId ? { ...row, amountPaid: parsedValue } : row);
      const newTotal = updated.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0);
      return { ...previous, receipts: updated, amount: newTotal > 0 ? newTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '' };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
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
      receiptItems: formData.paymentType === 'RECEIPT_BASED' ? formData.receipts.map((row) => ({ receiptId: row.receiptId, amountPaid: row.amountPaid })) : [],
      ...(formData.method === 'CHEQUE' && { chequeDetails: formData.chequeDetails }),
    };

    setSubmitting(true);
    try {
      const response = await createSupplierPaymentAction(payload);
      setSuccessPayload(response);
      feedback.actionSuccess('บันทึกการชำระใบรับสินค้า Supplier เรียบร้อยแล้ว', 'supplier-payment:receipt:create:success');
    } catch (requestError) {
      const message = requestError?.response?.data?.error?.message || requestError?.response?.data?.message || requestError?.message || 'บันทึกการชำระเงินไม่สำเร็จ';
      setError(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${message}`);
      feedback.actionError(requestError, 'บันทึกการชำระใบรับสินค้า Supplier ไม่สำเร็จ', 'supplier-payment:receipt:create:error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintVoucher = () => {
    feedback.info(`กำลังพิมพ์ใบสำคัญจ่ายสำหรับรายการ: ${successPayload.id}`);
    navigate(-1);
  };

  const selectedReceiptsTotal = formData.receipts.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0);
  const totalOutstandingAmount = receiptsReadyToPay.reduce((sum, receipt) => sum + Math.max(0, Number(receipt.totalAmount || 0) - Number(receipt.paidAmount || 0)), 0);
  const parsedAmountForValidation = parseFloat(formData.amount.replace(/,/g, ''));
  const isAmountMismatch = formData.paymentType === 'RECEIPT_BASED' && Math.abs(parsedAmountForValidation - selectedReceiptsTotal) > 0.01;
  const isSubmitButtonDisabled = submitting || Number.isNaN(parsedAmountForValidation) || parsedAmountForValidation <= 0 || isAmountMismatch;

  if (successPayload) {
    return (
      <div className="rounded-lg border-l-4 border-green-500 bg-green-100 p-6 text-center text-green-700 shadow-md" role="alert">
        <strong className="block text-xl font-bold">บันทึกการชำระเงินสำเร็จ!</strong>
        <p className="mt-2">ยอดชำระจำนวน {Number(successPayload.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท ได้ถูกบันทึกเรียบร้อย</p>
        <div className="mt-6 flex justify-center gap-4"><button onClick={() => navigate(-1)} className="rounded-lg bg-gray-500 px-6 py-2 font-semibold text-white hover:bg-gray-600">กลับไปที่รายการ</button><button onClick={handlePrintVoucher} className="rounded-lg bg-emerald-600 px-6 py-2 font-semibold text-white hover:bg-emerald-700">พิมพ์ใบสำคัญจ่าย</button></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          <div><label htmlFor="paymentDate" className="mb-1 block text-sm font-medium text-gray-700">วันที่ชำระ</label><input disabled={submitting} type="date" id="paymentDate" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className="h-[42px] w-full rounded-md border-gray-300 px-3 shadow-sm disabled:opacity-60" /></div>
          <div><label htmlFor="method" className="mb-1 block text-sm font-medium text-gray-700">วิธีชำระเงิน</label><select disabled={submitting} id="method" name="method" value={formData.method} onChange={handleChange} className="h-[42px] w-full rounded-md border-gray-300 shadow-sm disabled:opacity-60"><option value="CASH">เงินสด</option><option value="TRANSFER">โอนเงิน</option><option value="CHEQUE">เช็ค</option></select></div>
          <PaymentMethodInput label="จำนวนเงิน" value={formData.amount} onChange={handleAmountChange} onBlur={handleAmountBlur} disabled={submitting} />
        </div>
        {formData.method === 'CHEQUE' && <div className="grid grid-cols-1 gap-6 rounded-lg border border-blue-200 bg-blue-50 p-4 md:grid-cols-3"><div><label className="mb-1 block text-sm font-medium text-gray-700">เลขที่เช็ค</label><input disabled={submitting} type="text" name="chequeDetails.number" value={formData.chequeDetails.number} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div><div><label className="mb-1 block text-sm font-medium text-gray-700">ธนาคาร</label><input disabled={submitting} type="text" name="chequeDetails.bank" value={formData.chequeDetails.bank} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div><div><label className="mb-1 block text-sm font-medium text-gray-700">วันที่บนเช็ค</label><input disabled={submitting} type="date" name="chequeDetails.dueDate" value={formData.chequeDetails.dueDate} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm" /></div></div>}
        {formData.paymentType === 'RECEIPT_BASED' && <ReceiptSelectionTable supplierId={supplierId} receipts={receiptsReadyToPay} isLoading={isReceiptsLoading || submitting} selectedReceipts={formData.receipts} onToggle={handleCheckboxChange} onAmountPaidChange={handleReceiptAmountPaidChange} selectedReceiptsTotal={selectedReceiptsTotal} totalOutstandingAmount={totalOutstandingAmount} onSearch={handleSearchReceipts} />}
        <div><label htmlFor="note" className="mb-1 block text-sm font-medium text-gray-700">หมายเหตุ (ถ้ามี)</label><textarea disabled={submitting} id="note" name="note" value={formData.note} onChange={handleChange} className="w-full rounded-md border-gray-300 shadow-sm disabled:opacity-60" rows="2" /></div>
        {error && <div className="rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">{error}</div>}
        {isAmountMismatch && <div className="rounded-lg border border-yellow-400 bg-yellow-100 px-4 py-3 text-center text-yellow-700" role="alert">ยอดเงินรวมไม่ตรงกับยอดที่เลือกในตาราง</div>}
        <div className="flex justify-end pt-4"><button type="submit" className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-400" disabled={isSubmitButtonDisabled}>{submitting ? 'กำลังบันทึก...' : 'บันทึกการชำระเงิน'}</button></div>
      </form>
    </div>
  );
};

export default SupplierReceiptPaymentForm;
