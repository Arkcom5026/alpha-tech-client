import React from 'react';

const ProductSubmitBar = ({ isSubmitting, submitDisabled = false, submitLabel, mode }) => {
  const disabled = Boolean(isSubmitting || submitDisabled);

  const label = isSubmitting
    ? 'กำลังบันทึก...'
    : submitLabel
      ? submitLabel
      : mode === 'edit'
        ? 'บันทึกการแก้ไข'
        : 'เพิ่มสินค้า';

  return (
    <div className="flex justify-end border-t pt-6">
      <button
        type="submit"
        disabled={disabled}
        className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {label}
      </button>
    </div>
  );
};

export default ProductSubmitBar;
