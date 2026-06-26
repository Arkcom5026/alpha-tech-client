// src/features/sales/components/BillPrintOptions.jsx
// 🏛️ Premium Next-Gen POS Document Engine: (Compact Inline Layout Edition)

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

const BillPrintOptions = ({
  saleOption,
  setSaleOption,
  hideNoneOption = false,
  currentSaleMode = SALE_MODE.CASH,
}) => {
  const isValidSetter = typeof setSaleOption === 'function';
  const setSaleOptionSafe = isValidSetter ? setSaleOption : () => {};
  const isCash = currentSaleMode === SALE_MODE.CASH;
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  const options = useMemo(() => {
    if (isCredit) {
      return [{ value: PRINT_OPTION.DELIVERY_NOTE, label: 'ใบส่งของ', disabled: false }];
    }

    return [
      ...(hideNoneOption ? [] : [{ value: PRINT_OPTION.NONE, label: 'ไม่พิมพ์บิล', disabled: false }]),
      { value: PRINT_OPTION.RECEIPT, label: 'ใบกำกับภาษีอย่างย่อ', disabled: false },
      { value: PRINT_OPTION.TAX_INVOICE, label: 'ใบกำกับภาษีเต็มรูป', disabled: false },
      { value: PRINT_OPTION.DELIVERY_NOTE, label: 'ใบส่งของ', disabled: false },
    ];
  }, [hideNoneOption, isCredit]);

  useEffect(() => {
    if (isCredit && saleOption !== PRINT_OPTION.DELIVERY_NOTE) {
      setSaleOptionSafe(PRINT_OPTION.DELIVERY_NOTE);
      return;
    }
    if (isCash && hideNoneOption && saleOption === PRINT_OPTION.NONE) {
      setSaleOptionSafe(PRINT_OPTION.RECEIPT);
    }
  }, [isCredit, isCash, hideNoneOption, saleOption, setSaleOptionSafe]);

  if (!isValidSetter) return null;

  return (
    /* 🟢 [UI REFACTOR]: ปรับโครงสร้างชุดเลือกเอกสารให้เรียงเป็นกล่องแนวนอนขนาดกะทัดรัด ประหยัดเนื้อที่ */
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-black text-slate-400 select-none border-t border-slate-100 pt-2">
      <span className="text-slate-500 font-bold">เอกสารจัดพิมพ์:</span>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1" role="radiogroup" aria-label="ตัวเลือกการพิมพ์เอกสาร">
        {options.map((o) => (
          <label key={o.value} className={`flex items-center gap-1.5 cursor-pointer hover:text-slate-700 transition-colors ${o.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
            <input
              name="bill-print-option"
              type="radio"
              value={o.value}
              checked={saleOption === o.value}
              onChange={(e) => !o.disabled && setSaleOptionSafe(e.target.value)}
              className="accent-slate-900 h-3.5 w-3.5"
              disabled={o.disabled}
            />
            <span className={saleOption === o.value ? "text-slate-900 font-black" : ""}>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

BillPrintOptions.propTypes = {
  saleOption: PropTypes.oneOf(Object.values(PRINT_OPTION)).isRequired,
  setSaleOption: PropTypes.func.isRequired,
  hideNoneOption: PropTypes.bool,
  currentSaleMode: PropTypes.oneOf(Object.values(SALE_MODE)),
};

export default BillPrintOptions;