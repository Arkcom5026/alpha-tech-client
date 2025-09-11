// BillPrintOptions.jsx (Refined)
import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

export const PRINT_OPTION = {
  NONE: 'NONE',
  RECEIPT: 'RECEIPT',
  TAX_INVOICE: 'TAX_INVOICE',
  DELIVERY_NOTE: 'DELIVERY_NOTE',
};

export const SALE_MODE = {
  CASH: 'CASH',
  CREDIT: 'CREDIT',
};

const BillPrintOptions = ({ saleOption, setSaleOption, hideNoneOption = false, currentSaleMode = SALE_MODE.CASH }) => {
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  // สร้างชุดตัวเลือกตามโหมดการขาย
  const options = useMemo(() => {
    const base = [
      ...(hideNoneOption ? [] : [{ value: PRINT_OPTION.NONE, label: 'ไม่พิมพ์บิล', disabled: false }]),
      { value: PRINT_OPTION.RECEIPT, label: 'ใบกำกับภาษีอย่างย่อ', disabled: isCredit },
      { value: PRINT_OPTION.TAX_INVOICE, label: 'ใบกำกับภาษีเต็มรูป', disabled: isCredit },
      { value: PRINT_OPTION.DELIVERY_NOTE, label: 'ใบส่งของ', disabled: false },
    ];
    return base;
  }, [hideNoneOption, isCredit]);

  // ถ้าโหมดเครดิตและค่าปัจจุบันไม่ถูกต้อง → บังคับเป็นใบส่งของ
  useEffect(() => {
    if (isCredit && (saleOption === PRINT_OPTION.RECEIPT || saleOption === PRINT_OPTION.TAX_INVOICE)) {
      setSaleOption(PRINT_OPTION.DELIVERY_NOTE);
    }
  }, [isCredit, saleOption, setSaleOption]);

  const handleChange = (e) => {
    const next = e.target.value;
    const opt = options.find((o) => o.value === next);
    if (opt && !opt.disabled) setSaleOption(next);
  };

  return (
    <fieldset className="space-y-3 pl-3 text-base text-gray-700">
      {options.map((o) => (
        <label key={o.value} className={`flex items-center ${o.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <input
            type="radio"
            value={o.value}
            checked={saleOption === o.value}
            onChange={handleChange}
            className="form-radio text-blue-600 mr-2 w-4 h-4"
            disabled={o.disabled}
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
};

BillPrintOptions.propTypes = {
  saleOption: PropTypes.oneOf(Object.values(PRINT_OPTION)).isRequired,
  setSaleOption: PropTypes.func.isRequired,
  hideNoneOption: PropTypes.bool,
  currentSaleMode: PropTypes.oneOf(Object.values(SALE_MODE)),
};

export default BillPrintOptions;

