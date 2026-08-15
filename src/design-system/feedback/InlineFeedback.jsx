import React from 'react';

const toneClass = {
  info: 'border-blue-200 bg-blue-50 text-blue-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-800',
};

export function InlineFeedback({ tone = 'info', title, children, className = '' }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-3 py-2 text-sm ${toneClass[tone] || toneClass.info} ${className}`.trim()}
    >
      {title ? <div className="font-semibold">{title}</div> : null}
      {children ? <div className={title ? 'mt-1' : ''}>{children}</div> : null}
    </div>
  );
}

export function FieldMessage({ children, tone = 'error', id, className = '' }) {
  if (!children) return null;
  const textClass = tone === 'warning' ? 'text-amber-700' : tone === 'info' ? 'text-blue-700' : 'text-red-600';
  return (
    <p id={id} role={tone === 'error' ? 'alert' : undefined} className={`mt-1 text-xs ${textClass} ${className}`.trim()}>
      {children}
    </p>
  );
}

export function FormErrorSummary({ errors, title = 'กรุณาตรวจสอบข้อมูลอีกครั้ง', className = '' }) {
  const messages = Array.isArray(errors)
    ? errors.filter(Boolean)
    : Object.values(errors || {}).map((error) => error?.message || error).filter(Boolean);

  if (messages.length === 0) return null;

  return (
    <InlineFeedback tone="error" title={title} className={className}>
      <ul className="list-disc space-y-1 pl-5">
        {messages.map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
      </ul>
    </InlineFeedback>
  );
}
