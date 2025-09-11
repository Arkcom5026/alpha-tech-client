// PaymentMethodInput.jsx (Refactored: props safe, UX hardened, optional disabled)
import React from 'react';
import PropTypes from 'prop-types';

const preventInvalidNumberKeys = (e) => {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
};

const PaymentMethodInput = ({
  cash = 0,
  transfer = 0,
  credit = 0,
  onCashChange,
  onTransferChange,
  onCreditChange,
  cardRef,
  onCardRefChange,
  disabled = false,
}) => {
  const creditNum = Number(credit) || 0;

  return (
    <div className="gap-4">
      <div className="min-w-[200px] rounded-xl shadow-sm border bg-green-50 border-green-100 px-3 py-3">
        {/* เงินสด */}
        <h3 className="text-base font-bold text-gray-800 mb-1">เงินสด</h3>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-3 text-2xl text-right font-bold text-green-700 focus:ring-2 focus:ring-green-500 shadow-sm"
          placeholder="0.00"
          value={cash}
          onChange={onCashChange}
          onFocus={(e) => e.target.select()}
          onKeyDown={preventInvalidNumberKeys}
          onWheel={(e) => e.currentTarget.blur()}
          aria-label="จำนวนเงินสด"
          disabled={disabled}
        />

        {/* เงินโอน */}
        <div className="py-2">
          <h3 className="text-base font-bold text-gray-800 mb-1">เงินโอน</h3>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-sky-700 focus:ring-2 focus:ring-sky-500 shadow-sm"
            placeholder="0.00"
            value={transfer}
            onChange={onTransferChange}
            onFocus={(e) => e.target.select()}
            onKeyDown={preventInvalidNumberKeys}
            onWheel={(e) => e.currentTarget.blur()}
            aria-label="จำนวนเงินโอน"
            disabled={disabled}
          />
        </div>

        {/* บัตรเครดิต */}
        <div className="py-2">
          <h3 className="text-base font-bold text-gray-800 mb-1">บัตรเครดิต</h3>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-2xl text-right font-bold text-yellow-700 focus:ring-2 focus:ring-yellow-500 shadow-sm"
            placeholder="0.00"
            value={credit}
            onChange={onCreditChange}
            onFocus={(e) => e.target.select()}
            onKeyDown={preventInvalidNumberKeys}
            onWheel={(e) => e.currentTarget.blur()}
            aria-label="จำนวนชำระด้วยบัตรเครดิต"
            disabled={disabled}
          />
        </div>

        {/* เลขอ้างอิงบัตรเครดิต */}
        {creditNum > 0 && (
          <div className="py-1">
            <input
              type="text"
              className="w-full h-[50px] border border-gray-300 rounded-md px-3 py-2 text-xl text-right font-medium text-gray-700 focus:ring-2 focus:ring-yellow-400 shadow-sm"
              placeholder="กรอกเลขอ้างอิงบัตรเครดิต..."
              value={cardRef || ''}
              onChange={onCardRefChange}
              aria-label="เลขอ้างอิงบัตรเครดิต"
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};

PaymentMethodInput.propTypes = {
  cash: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  transfer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  credit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onCashChange: PropTypes.func.isRequired,
  onTransferChange: PropTypes.func.isRequired,
  onCreditChange: PropTypes.func.isRequired,
  cardRef: PropTypes.string,
  onCardRefChange: PropTypes.func,
  disabled: PropTypes.bool,
};

export default PaymentMethodInput;

