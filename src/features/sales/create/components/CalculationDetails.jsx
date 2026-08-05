import React from 'react';
import PropTypes from 'prop-types';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const preventInvalidNumberKeys = (event) => {
  if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault();
};

const SummaryRow = ({ label, value, tone = 'neutral', emphasized = false }) => {
  const toneClass = {
    neutral: 'text-slate-700',
    discount: 'text-amber-700',
    tax: 'text-slate-600',
    deposit: 'text-teal-700',
  }[tone];

  return (
    <div className={`flex items-center justify-between gap-3 ${toneClass}`}>
      <span className={emphasized ? 'font-semibold' : 'font-medium'}>{label}</span>
      <span className={`font-mono tabular-nums ${emphasized ? 'font-semibold text-slate-900' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
};

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['neutral', 'discount', 'tax', 'deposit']),
  emphasized: PropTypes.bool,
};

const CalculationDetails = ({
  totalOriginalPrice,
  totalDiscountOnly,
  billDiscount,
  setBillDiscount,
  totalDiscount,
  priceBeforeVat,
  vatAmount,
  customerDepositAmount,
  depositUsed,
  handleDepositUsedChange,
  disabled = false,
}) => {
  const totalOriginal = Number(totalOriginalPrice) || 0;
  const itemDiscount = Number(totalDiscountOnly) || 0;
  const billDiscountValue = Number(billDiscount) || 0;
  const totalDiscountValue = Number(totalDiscount) || 0;
  const netAmount = Number(priceBeforeVat) || 0;
  const vatAmountValue = Number(vatAmount) || 0;
  const depositBalance = Number(customerDepositAmount) || 0;
  const depositUsedValue = Number(depositUsed) || 0;
  const remainingDeposit = Math.max(0, depositBalance - depositUsedValue);
  const billDiscountExceedsTotal = billDiscountValue > totalOriginal;

  const numberInputClass = `h-11 w-32 rounded-xl border bg-white px-3 text-right font-mono text-sm font-semibold text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
    billDiscountExceedsTotal
      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-300 focus:border-teal-500 focus:ring-teal-100'
  }`;

  return (
    <div className="w-full space-y-4 text-sm">
      <div className="space-y-2.5">
        <SummaryRow label="ยอดรวมสินค้า" value={`${formatMoney(totalOriginal)} ฿`} emphasized />
        <SummaryRow label="ส่วนลดรายสินค้า" value={`- ${formatMoney(itemDiscount)} ฿`} tone="discount" />

        <div className="flex items-center justify-between gap-3 text-amber-700">
          <label htmlFor="sale-bill-discount" className="font-medium">
            ส่วนลดท้ายบิล
          </label>
          <input
            id="sale-bill-discount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className={numberInputClass}
            placeholder="0.00"
            value={billDiscountValue === 0 ? '' : billDiscountValue}
            onChange={setBillDiscount}
            onKeyDown={preventInvalidNumberKeys}
            onWheel={(event) => event.currentTarget.blur()}
            disabled={disabled}
          />
        </div>

        {billDiscountExceedsTotal ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            ส่วนลดท้ายบิลต้องไม่เกินยอดรวมสินค้า {formatMoney(totalOriginal)} บาท
          </div>
        ) : null}

        <div className="border-t border-slate-200 pt-3">
          <SummaryRow
            label="ส่วนลดรวม"
            value={`- ${formatMoney(totalDiscountValue)} ฿`}
            tone="discount"
            emphasized
          />
        </div>
      </div>

      <div className="space-y-2.5 rounded-xl bg-slate-50 p-3">
        <SummaryRow label="มูลค่าก่อนภาษี" value={`${formatMoney(netAmount)} ฿`} />
        <SummaryRow label="ภาษีมูลค่าเพิ่ม 7%" value={`${formatMoney(vatAmountValue)} ฿`} tone="tax" />
      </div>

      {depositBalance > 0 ? (
        <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="sale-deposit-used" className="font-semibold text-teal-800">
              ใช้เงินมัดจำ
            </label>
            <input
              id="sale-deposit-used"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className="h-11 w-32 rounded-xl border border-teal-300 bg-white px-3 text-right font-mono text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              placeholder="0.00"
              value={depositUsedValue === 0 ? '' : depositUsedValue}
              onChange={handleDepositUsedChange}
              onKeyDown={preventInvalidNumberKeys}
              onWheel={(event) => event.currentTarget.blur()}
              disabled={disabled}
            />
          </div>
          <SummaryRow
            label="เงินมัดจำคงเหลือ"
            value={`${formatMoney(remainingDeposit)} ฿`}
            tone="deposit"
            emphasized
          />
        </div>
      ) : null}
    </div>
  );
};

CalculationDetails.propTypes = {
  totalOriginalPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  totalDiscountOnly: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  billDiscount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setBillDiscount: PropTypes.func.isRequired,
  totalDiscount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  priceBeforeVat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  vatAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  customerDepositAmount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  depositUsed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  handleDepositUsedChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default CalculationDetails;
