import { forwardRef, useEffect, useRef, useState } from 'react';

export const ScanInput = forwardRef(function ScanInput(
  {
    onSubmit,
    placeholder = 'สแกนหรือกรอกรหัสสินค้า',
    disabled = false,
    autoSubmit = true,
    delay = 180,
    compact = false,
    className = '',
  },
  ref
) {
  const [value, setValue] = useState('');
  const valueRef = useRef('');
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') ref(inputRef.current);
    else ref.current = inputRef.current;
  }, [ref]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const focusInput = () => {
    window.setTimeout(() => inputRef.current?.focus?.(), 0);
  };

  const runSubmit = () => {
    const normalizedValue = valueRef.current.trim();
    if (!normalizedValue || disabled) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    onSubmit?.(normalizedValue);
    valueRef.current = '';
    setValue('');
    focusInput();
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    valueRef.current = nextValue;
    setValue(nextValue);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoSubmit && nextValue.trim() && !disabled) {
      timerRef.current = window.setTimeout(runSubmit, delay);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    runSubmit();
  };

  const widthClass = compact ? 'sm:max-w-sm' : 'w-full';

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="text"
      autoComplete="off"
      aria-label="ช่องสแกนสินค้า"
      className={`min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${widthClass} ${className}`}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        if (autoSubmit && valueRef.current.trim()) runSubmit();
      }}
    />
  );
});

export default ScanInput;
