


// src/features/customerReceipt/components/CustomerReceiptSearchFilters.jsx

import { useMemo } from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'ACTIVE', label: 'ใช้งานอยู่' },
  { value: 'FULLY_ALLOCATED', label: 'ตัดครบแล้ว' },
  { value: 'CANCELLED', label: 'ยกเลิกแล้ว' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', label: 'ทุกวิธีชำระ' },
  { value: 'CASH', label: 'เงินสด' },
  { value: 'BANK_TRANSFER', label: 'โอนเงิน' },
  { value: 'QR_CODE', label: 'QR Code' },
  { value: 'CREDIT_CARD', label: 'บัตรเครดิต' },
  { value: 'DEBIT_CARD', label: 'บัตรเดบิต' },
  { value: 'OTHER', label: 'อื่น ๆ' },
];

const CustomerReceiptSearchFilters = ({
  filters = {},
  loading = false,
  onChange,
  onSearch,
  onReset,
}) => {
  const safeFilters = useMemo(
    () => ({
      keyword: filters?.keyword || '',
      status: filters?.status || '',
      customerId: filters?.customerId || '',
      paymentMethod: filters?.paymentMethod || '',
      fromDate: filters?.fromDate || '',
      toDate: filters?.toDate || '',
    }),
    [filters]
  );

  const handleChange = (key) => (event) => {
    if (!onChange) return;

    const rawValue = event.target.value;
    let nextValue = rawValue;

    if (key === 'customerId') {
      nextValue = rawValue === '' ? '' : String(Math.max(1, Number(rawValue) || 0));
      if (nextValue === '0') nextValue = '';
    }

    if (key === 'fromDate' && safeFilters.toDate && rawValue && rawValue > safeFilters.toDate) {
      onChange({
        fromDate: rawValue,
        toDate: rawValue,
      });
      return;
    }

    if (key === 'toDate' && safeFilters.fromDate && rawValue && rawValue < safeFilters.fromDate) {
      onChange({
        fromDate: rawValue,
        toDate: rawValue,
      });
      return;
    }

    onChange({
      [key]: nextValue,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onSearch) return;
    await onSearch();
  };

  const handleResetClick = async () => {
    if (!onReset) return;
    await onReset();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="customer-receipt-keyword" className="text-sm font-medium text-gray-700">
            ค้นหา
          </label>
          <input
            id="customer-receipt-keyword"
            type="text"
            value={safeFilters.keyword}
            onChange={handleChange('keyword')}
            placeholder="เลขที่ใบรับเงิน / ลูกค้า / อ้างอิง / หมายเหตุ"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="customer-receipt-status" className="text-sm font-medium text-gray-700">
            สถานะ
          </label>
          <select
            id="customer-receipt-status"
            value={safeFilters.status}
            onChange={handleChange('status')}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all-status'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="customer-receipt-payment-method" className="text-sm font-medium text-gray-700">
            วิธีชำระ
          </label>
          <select
            id="customer-receipt-payment-method"
            value={safeFilters.paymentMethod}
            onChange={handleChange('paymentMethod')}
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value || 'all-payment-method'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="customer-receipt-customer-id" className="text-sm font-medium text-gray-700">
            รหัสลูกค้า
          </label>
          <input
            id="customer-receipt-customer-id"
            type="number"
            min="1"
            value={safeFilters.customerId}
            onChange={handleChange('customerId')}
            placeholder="กรอกเมื่อทราบรหัสลูกค้า"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5">
          <label htmlFor="customer-receipt-from-date" className="text-sm font-medium text-gray-700">
            วันที่รับเงินจาก
          </label>
          <input
            id="customer-receipt-from-date"
            type="date"
            value={safeFilters.fromDate}
            onChange={handleChange('fromDate')}
            max={safeFilters.toDate || undefined}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="customer-receipt-to-date" className="text-sm font-medium text-gray-700">
            ถึงวันที่
          </label>
          <input
            id="customer-receipt-to-date"
            type="date"
            value={safeFilters.toDate}
            onChange={handleChange('toDate')}
            min={safeFilters.fromDate || undefined}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
        </button>

        <button
          type="button"
          onClick={handleResetClick}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ล้างตัวกรอง
        </button>
      </div>
    </form>
  );
};

export default CustomerReceiptSearchFilters;


