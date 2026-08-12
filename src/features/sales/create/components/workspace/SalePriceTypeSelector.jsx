import React from 'react';

const OPTIONS = [
  { value: 'retail', label: 'ราคาปลีก' },
  { value: 'technician', label: 'ราคาช่าง' },
  { value: 'wholesale', label: 'ราคาส่ง' },
];

const SalePriceTypeSelector = ({ value, onChange, disabled = false }) => (
  <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner" aria-label="เลือกระดับราคาขาย">
    {OPTIONS.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange?.(option.value)}
          disabled={disabled}
          aria-pressed={active}
          className={`min-h-9 rounded-xl px-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            active
              ? 'border border-emerald-200 bg-white text-emerald-800 shadow-sm ring-1 ring-emerald-100'
              : 'border border-transparent bg-transparent text-slate-500 hover:bg-white hover:text-slate-900'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SalePriceTypeSelector;
