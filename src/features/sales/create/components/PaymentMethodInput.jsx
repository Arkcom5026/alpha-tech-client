import React from 'react';

const preventInvalidNumberKeys = (event) => {
  if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault();
};

const moneyValue = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  if (text === '' || text === '0' || text === '0.0' || text === '0.00') return '';
  return value;
};

const PaymentAmountField = ({ label, value, onChange, testId, disabled }) => (
  <label className="grid gap-1.5">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <input
      type="number"
      data-testid={testId}
      inputMode="decimal"
      min="0"
      step="0.01"
      value={moneyValue(value)}
      onChange={onChange}
      onFocus={(event) => event.target.select?.()}
      onKeyDown={preventInvalidNumberKeys}
      onWheel={(event) => event.currentTarget.blur()}
      disabled={disabled}
      placeholder="0.00"
      className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-right font-mono text-base font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100 disabled:text-slate-400"
    />
  </label>
);

const PaymentMethodInput = ({
  cash = '',
  transfer = '',
  credit = '',
  onCashChange,
  onTransferChange,
  onCreditChange,
  cardRef = '',
  onCardRefChange,
  disabled = false,
}) => (
  <div className="grid w-full gap-3">
    <PaymentAmountField
      label="เงินสด"
      value={cash}
      onChange={onCashChange}
      testId="pos-sale-cash-input"
      disabled={disabled}
    />
    <PaymentAmountField label="เงินโอน" value={transfer} onChange={onTransferChange} disabled={disabled} />
    <PaymentAmountField label="บัตรเครดิต" value={credit} onChange={onCreditChange} disabled={disabled} />

    {(Number(credit) > 0 || String(cardRef).trim().length > 0) && (
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-slate-700">เลขอ้างอิงบัตร</span>
        <input
          type="text"
          value={cardRef || ''}
          onChange={onCardRefChange}
          disabled={disabled}
          placeholder="เลขอ้างอิงจากเครื่องรับบัตร"
          className="h-11 rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
        />
      </label>
    )}
  </div>
);

export default PaymentMethodInput;
