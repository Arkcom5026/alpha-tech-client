import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PRINT_OPTION, SALE_MODE } from '../contracts/salePrintOptions';

const BillPrintOptions = ({
  saleOption,
  setSaleOption,
  includeDeliveryNote = false,
  setIncludeDeliveryNote,
  hideNoneOption = false,
  currentSaleMode = SALE_MODE.CASH,
}) => {
  const isValidSetter = typeof setSaleOption === 'function';
  const setSaleOptionSafe = useMemo(
    () => (isValidSetter ? setSaleOption : () => {}),
    [isValidSetter, setSaleOption]
  );
  const isCash = currentSaleMode === SALE_MODE.CASH;
  const isCredit = currentSaleMode === SALE_MODE.CREDIT;

  const options = useMemo(() => {
    if (isCredit) {
      return [{ value: PRINT_OPTION.DELIVERY_NOTE, label: 'ใบส่งสินค้า', disabled: false }];
    }

    return [
      ...(hideNoneOption ? [] : [{ value: PRINT_OPTION.NONE, label: 'ไม่พิมพ์เอกสาร', disabled: false }]),
      { value: PRINT_OPTION.ORDINARY_RECEIPT, label: 'ใบเสร็จรับเงิน', disabled: false },
      { value: PRINT_OPTION.RECEIPT, label: 'ใบกำกับภาษีอย่างย่อ', disabled: false },
      { value: PRINT_OPTION.TAX_INVOICE, label: 'ใบกำกับภาษีเต็มรูป', disabled: false },
    ];
  }, [hideNoneOption, isCredit]);

  useEffect(() => {
    if (isCredit && saleOption !== PRINT_OPTION.DELIVERY_NOTE) {
      setSaleOptionSafe(PRINT_OPTION.DELIVERY_NOTE);
      return;
    }
    if (isCash && hideNoneOption && [PRINT_OPTION.NONE, PRINT_OPTION.DELIVERY_NOTE].includes(saleOption)) {
      setSaleOptionSafe(PRINT_OPTION.RECEIPT);
    }
  }, [hideNoneOption, isCash, isCredit, saleOption, setSaleOptionSafe]);

  if (!isValidSetter) return null;

  return (
    <fieldset className="space-y-2 border-t border-slate-200 pt-3">
      <legend className="text-xs font-semibold text-slate-700">เอกสารหลังบันทึกการขาย</legend>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-label="ตัวเลือกเอกสารหลังบันทึกการขาย"
      >
        {options.map((option) => {
          const active = saleOption === option.value;

          return (
            <label
              key={option.value}
              className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                option.disabled
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60'
                  : active
                    ? 'cursor-pointer border-emerald-300 bg-emerald-100 font-semibold text-emerald-900'
                    : 'cursor-pointer border-teal-200 bg-teal-50 font-medium text-teal-900 hover:border-teal-300 hover:bg-teal-100'
              }`}
            >
              <input
                name="bill-print-option"
                type="radio"
                value={option.value}
                checked={active}
                onChange={(event) => !option.disabled && setSaleOptionSafe(event.target.value)}
                className="h-4 w-4 accent-emerald-600"
                disabled={option.disabled}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {isCash ? (
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900">
          <input
            type="checkbox"
            checked={includeDeliveryNote}
            onChange={(event) => setIncludeDeliveryNote?.(event.target.checked)}
            className="h-4 w-4 accent-blue-700"
          />
          <span>ออกใบส่งของเพิ่มเติม</span>
          <span className="text-xs font-normal text-blue-700">เอกสารประกอบการขายเงินสด ไม่ตัดสต๊อกซ้ำ</span>
        </label>
      ) : null}
      {isCredit ? (
        <p className="text-xs font-medium text-amber-700">
          การขายแบบเครดิตใช้ใบส่งสินค้าเป็นเอกสารหลัก
        </p>
      ) : null}
    </fieldset>
  );
};

BillPrintOptions.propTypes = {
  saleOption: PropTypes.oneOf(Object.values(PRINT_OPTION)).isRequired,
  setSaleOption: PropTypes.func.isRequired,
  includeDeliveryNote: PropTypes.bool,
  setIncludeDeliveryNote: PropTypes.func,
  hideNoneOption: PropTypes.bool,
  currentSaleMode: PropTypes.oneOf(Object.values(SALE_MODE)),
};

export default BillPrintOptions;
