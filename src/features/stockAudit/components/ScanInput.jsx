

// =============================
// client/src/features/stockAudit/components/ScanInput.jsx (updated)
// - กว้างพอดี (compact ~320px)
// - ยิงเสร็จไม่ต้องกด Enter: autosubmit ด้วย delay สั้น ๆ + onBlur

import { forwardRef, useState, useRef, useEffect } from 'react'

export const ScanInput = forwardRef(function ScanInput(
  {
    onSubmit,
    placeholder = 'ยิงแล้วปล่อยได้เลย',
    disabled = false,
    autoSubmit = true,
    delay = 180,
    compact = true,
    className = '',
  },
  ref
) {
  const [value, setValue] = useState('')
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  // expose outer ref if provided
  useEffect(() => {
    if (!ref) return
    if (typeof ref === 'function') ref(inputRef.current)
    else ref.current = inputRef.current
  }, [ref])

  const runSubmit = () => {
    const v = value.trim()
    if (!v) return
    onSubmit?.(v)
    setValue('')
    setTimeout(() => inputRef.current?.focus?.(), 0)
  }

  const handleChange = (e) => {
    const v = e.target.value
    setValue(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (autoSubmit && v.trim() && !disabled) {
      timerRef.current = setTimeout(runSubmit, delay)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (timerRef.current) clearTimeout(timerRef.current)
      runSubmit()
    }
  }

  const widthStyle = compact ? { maxWidth: 320 } : undefined

  return (
    <input
      ref={inputRef}
      className={`form-control ${className}`}
      style={widthStyle}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={() => autoSubmit && runSubmit()}
    />
  )
})

export default ScanInput

// ใช้งานในหน้าเพจ (ตัวอย่าง)
// <ScanInput ref={scanRef} onSubmit={handleScan} disabled={isScanning} compact autoSubmit delay={180} />



