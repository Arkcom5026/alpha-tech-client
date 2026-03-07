






//  src/features/customerReceipt/components/CustomerReceiptForm.jsx

import { useEffect, useMemo, useState } from 'react';
import useCustomerReceiptStore from '../store/customerReceiptStore';

const PAYMENT_METHOD_OPTIONS = [
  { value: 'CHEQUE', label: 'เช็ค' },
  { value: 'CASH', label: 'เงินสด' },
  { value: 'BANK_TRANSFER', label: 'โอนเงิน' },
  { value: 'QR_CODE', label: 'QR Code' },
  { value: 'CREDIT_CARD', label: 'บัตรเครดิต' },
  { value: 'DEBIT_CARD', label: 'บัตรเดบิต' },
  { value: 'OTHER', label: 'อื่น ๆ' },
];

const CUSTOMER_SEARCH_MODE_OPTIONS = [
  { value: 'NAME', label: 'ค้นหาจากชื่อ/หน่วยงาน' },
  { value: 'PHONE', label: 'ค้นหาจากเบอร์โทร' },
];

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildInitialForm = (initialValues = {}) => ({
  customerId: initialValues?.customerId ? String(initialValues.customerId) : '',
  totalAmount:
    Number(initialValues?.totalAmount || 0) > 0 ? String(initialValues.totalAmount) : '',
  paymentMethod: initialValues?.paymentMethod || 'BANK_TRANSFER',
  receivedAt: initialValues?.receivedAt
    ? String(initialValues.receivedAt).slice(0, 10)
    : getTodayInputValue(),
  referenceNo: initialValues?.referenceNo || '',
  note: initialValues?.note || '',
});

const fieldClassName =
  'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60';

const labelClassName = 'text-sm font-medium text-gray-700';

const CustomerReceiptForm = ({
  initialValues = {},
  submitting = false,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => buildInitialForm(initialValues));
  const [formError, setFormError] = useState('');
  const [customerSearchMode, setCustomerSearchMode] = useState('NAME');
  const [customerSearchKeyword, setCustomerSearchKeyword] = useState('');

  const customerSearchResults = useCustomerReceiptStore((state) => state.customerSearchResults);
  const selectedCustomer = useCustomerReceiptStore((state) => state.selectedCustomer);
  const customerSearchLoading = useCustomerReceiptStore((state) => state.customerSearchLoading);
  const customerSearchError = useCustomerReceiptStore((state) => state.customerSearchError);
  const searchCustomersForReceiptAction = useCustomerReceiptStore(
    (state) => state.searchCustomersForReceiptAction
  );
  const selectCustomerForReceiptAction = useCustomerReceiptStore(
    (state) => state.selectCustomerForReceiptAction
  );
  const clearCustomerReceiptCustomerSearchAction = useCustomerReceiptStore(
    (state) => state.clearCustomerReceiptCustomerSearchAction
  );
  const clearSelectedCustomerForReceiptAction = useCustomerReceiptStore(
    (state) => state.clearSelectedCustomerForReceiptAction
  );

  const amountPreview = useMemo(() => {
    const value = Number(form.totalAmount || 0);
    if (!Number.isFinite(value) || value <= 0) return '0.00';

    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, [form.totalAmount]);

  const hasSelectedCustomer =
    Number.isInteger(Number(form.customerId)) && Number(form.customerId) > 0;

  useEffect(() => {
    return () => {
      clearCustomerReceiptCustomerSearchAction();
    };
  }, [clearCustomerReceiptCustomerSearchAction]);

  useEffect(() => {
    if (!selectedCustomer?.id) return;

    const isOrganizationCustomer = Boolean(selectedCustomer.companyName);

    setForm((prev) => ({
      ...prev,
      customerId: String(selectedCustomer.id),
      paymentMethod:
        isOrganizationCustomer && !initialValues?.paymentMethod ? 'CHEQUE' : prev.paymentMethod,
    }));
  }, [initialValues?.paymentMethod, selectedCustomer]);

  const handleChange = (key) => (event) => {
    setFormError('');
    setForm((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleSearchKeywordChange = (event) => {
    setFormError('');
    setCustomerSearchKeyword(event.target.value);
  };

  const handleSearchCustomer = async () => {
    const keyword = String(customerSearchKeyword || '').trim();

    if (!keyword) {
      setFormError('กรุณากรอกคำค้นลูกค้าก่อนค้นหา');
      return;
    }

    setFormError('');

    try {
      await searchCustomersForReceiptAction({
        mode: customerSearchMode,
        keyword,
      });
    } catch (error) {
      // error is already mapped in store
    }
  };

  const handleSelectCustomer = (customer) => {
    if (!customer?.id) return;

    setFormError('');
    selectCustomerForReceiptAction(customer);
    setForm((prev) => ({
      ...prev,
      customerId: String(customer.id),
    }));
  };

  const handleChangeSelectedCustomer = () => {
    setFormError('');
    clearSelectedCustomerForReceiptAction();
    setForm((prev) => ({
      ...prev,
      customerId: '',
    }));
  };

  const validateForm = () => {
    const totalAmount = Number(form.totalAmount);

    if (!hasSelectedCustomer) {
      return 'กรุณาเลือกลูกค้าที่ต้องการรับชำระจากผลการค้นหา';
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return 'กรุณาระบุยอดรับเงินให้มากกว่า 0';
    }

    if (!form.paymentMethod) {
      return 'กรุณาเลือกวิธีชำระ';
    }

    if (!form.receivedAt) {
      return 'กรุณาระบุวันที่รับเงิน';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      customerId: Number(form.customerId),
      totalAmount: Number(form.totalAmount),
      paymentMethod: form.paymentMethod,
      receivedAt: form.receivedAt,
      referenceNo: form.referenceNo.trim() || null,
      note: form.note.trim() || null,
    };

    await onSubmit?.(payload);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {!!formError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">ค้นหาลูกค้าที่มาชำระเงิน</h2>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[220px_minmax(0,1fr)_140px] xl:items-end">
            <div className="space-y-1.5">
              <label htmlFor="customer-receipt-customer-search-mode" className={labelClassName}>
                วิธีค้นหา
              </label>
              <select
                id="customer-receipt-customer-search-mode"
                value={customerSearchMode}
                onChange={(event) => {
                  setFormError('');
                  setCustomerSearchMode(event.target.value);
                }}
                disabled={submitting || customerSearchLoading}
                className={fieldClassName}
              >
                {CUSTOMER_SEARCH_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customer-receipt-customer-search-keyword" className={labelClassName}>
                คำค้นลูกค้า
              </label>
              <input
                id="customer-receipt-customer-search-keyword"
                type="text"
                value={customerSearchKeyword}
                onChange={handleSearchKeywordChange}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearchCustomer();
                  }
                }}
                placeholder={
                  customerSearchMode === 'PHONE'
                    ? 'เช่น 0812345678'
                    : 'เช่น บริษัท เอ บี ซี / นายสมชาย'
                }
                disabled={submitting || customerSearchLoading}
                className={fieldClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClassName}>การค้นหา</label>
              <button
                type="button"
                onClick={handleSearchCustomer}
                disabled={submitting || customerSearchLoading}
                className="inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {customerSearchLoading ? 'กำลังค้นหา...' : 'ค้นหาลูกค้า'}
              </button>
            </div>
          </div>

          {!!customerSearchError && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {customerSearchError}
            </div>
          )}

          {!selectedCustomer && !!customerSearchResults.length && (
            <div className="mt-4 rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">ผลการค้นหาลูกค้า</p>
              </div>

              <div className="divide-y divide-gray-100">
                {customerSearchResults.map((customer) => {
                  const customerLabel = customer.companyName || customer.name || '-';
                  const customerSubLabel = customer.companyName && customer.name ? customer.name : '';
                  const isSelected = Number(form.customerId) === Number(customer.id);

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className={`block w-full px-4 py-3 text-left transition ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{customerLabel}</p>
                          {!!customerSubLabel && (
                            <p className="mt-1 text-xs text-gray-600">ผู้ติดต่อ: {customerSubLabel}</p>
                          )}
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>รหัสลูกค้า: {customer.customerCode || '-'}</span>
                            <span>เบอร์โทร: {customer.phone || '-'}</span>
                            <span>เลขผู้เสียภาษี: {customer.taxId || '-'}</span>
                          </div>
                        </div>

                        <div
                          className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-medium ${
                            isSelected
                              ? 'border border-blue-200 bg-white text-blue-700'
                              : 'border border-gray-200 bg-white text-gray-600'
                          }`}
                        >
                          {isSelected ? 'เลือกลูกค้านี้แล้ว' : 'เลือกลูกค้ารายการนี้'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">ลูกค้าที่เลือก</p>
                {selectedCustomer ? (
                  <div className="mt-1 space-y-1 text-xs text-gray-600">
                    <p>
                      ชื่อ/หน่วยงาน:{' '}
                      <span className="font-medium text-gray-900">
                        {selectedCustomer.companyName || selectedCustomer.name || '-'}
                      </span>
                    </p>
                    {!!selectedCustomer.companyName && !!selectedCustomer.name && (
                      <p>ผู้ติดต่อ: {selectedCustomer.name}</p>
                    )}
                    <p>รหัสลูกค้า: {selectedCustomer.customerCode || '-'}</p>
                    <p>เบอร์โทร: {selectedCustomer.phone || '-'}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    กรุณาค้นหาและเลือกลูกค้าที่ต้องการรับชำระก่อนบันทึกใบรับเงิน
                  </p>
                )}
              </div>

              <div className="flex flex-col items-stretch gap-2 md:items-end">
                <div
                  className={`inline-flex items-center rounded-xl px-3 py-2 text-xs font-medium ${
                    hasSelectedCustomer
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {hasSelectedCustomer ? 'เลือกลูกค้าแล้ว' : 'ยังไม่ได้เลือกลูกค้า'}
                </div>

                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={handleChangeSelectedCustomer}
                    disabled={submitting || customerSearchLoading}
                    className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    เปลี่ยนลูกค้า
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">ข้อมูลการรับชำระ</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="customer-receipt-total-amount" className={labelClassName}>
              ยอดรับเงิน
            </label>
            <input
              id="customer-receipt-total-amount"
              type="number"
              className={`${fieldClassName} text-right`}
              placeholder="0.00"
              value={form.totalAmount === '0' ? '' : form.totalAmount}
              onChange={handleChange('totalAmount')}
              min="0"
              step="0.01"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500">
              ยอดนี้จะยังไม่ตัดชำระบิลทันที จนกว่าจะไปทำ allocation ในขั้นตอนถัดไป
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="customer-receipt-payment-method" className={labelClassName}>
              วิธีชำระ
            </label>
            
            <select
              id="customer-receipt-payment-method"
              value={form.paymentMethod}
              onChange={handleChange('paymentMethod')}
              disabled={submitting}
              className={fieldClassName}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="customer-receipt-received-at" className={labelClassName}>
              วันที่รับเงิน
            </label>
            <input
              id="customer-receipt-received-at"
              type="date"
              value={form.receivedAt}
              onChange={handleChange('receivedAt')}
              disabled={submitting}
              className={fieldClassName}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="customer-receipt-reference-no" className={labelClassName}>
              เลขอ้างอิงการรับชำระ
            </label>
            <input
              id="customer-receipt-reference-no"
              type="text"
              value={form.referenceNo}
              onChange={handleChange('referenceNo')}
              placeholder="เช่น TRX-240305-0001"
              disabled={submitting}
              className={fieldClassName}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="customer-receipt-note" className={labelClassName}>
              หมายเหตุ
            </label>
            <textarea
              id="customer-receipt-note"
              rows={4}
              value={form.note}
              onChange={handleChange('note')}
              placeholder="บันทึกรายละเอียดเพิ่มเติมเกี่ยวกับการรับเงินครั้งนี้"
              disabled={submitting}
              className={fieldClassName}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 shadow-sm">
        <div className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">สรุปยอดรับเงิน</p>
            <p className="text-xs text-blue-700">
              หลังบันทึกแล้ว ระบบจะสร้าง CustomerReceipt เพื่อรอการ allocate ไปยังบิลขาย
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-700">ยอดรับปัจจุบัน</p>
            <p className="text-3xl font-semibold tracking-tight text-blue-900">{amountPreview}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'กำลังบันทึก...' : 'บันทึกใบรับเงิน'}
        </button>
      </div>
    </form>
  );
};

export default CustomerReceiptForm;







