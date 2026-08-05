import React from 'react';

const OPTIONS = [
  { value: 'retail', label: 'ราคาปลีก' },
  { value: 'technician', label: 'ราคาช่าง' },
  { value: 'wholesale', label: 'ราคาส่ง' },
];

const SalePriceTypeSelector = ({ value, onChange, disabled = false }) => (
  <div className="inline-flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1" aria-label="เลือกระดับราคาขาย">
    {OPTIONS.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
          disabled={disabled}
          className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            active
              ? 'border border-emerald-300 bg-emerald-100 text-emerald-900'
              : 'border border-transparent bg-transparent text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SalePriceTypeSelector;
