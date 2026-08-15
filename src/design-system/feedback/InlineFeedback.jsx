import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, LoaderCircle, X } from 'lucide-react';
import { IconButton } from '../foundation.jsx';

const join = (...values) => values.filter(Boolean).join(' ');

const variants = {
  success: {
    icon: CheckCircle2,
    className: 'border-[hsl(var(--ads-success)/0.3)] bg-[hsl(var(--ads-success-subtle))] text-[hsl(var(--ads-success))]',
  },
  info: {
    icon: Info,
    className: 'border-[hsl(var(--ads-info)/0.3)] bg-[hsl(var(--ads-info-subtle))] text-[hsl(var(--ads-info))]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-[hsl(var(--ads-warning)/0.35)] bg-[hsl(var(--ads-warning-subtle))] text-[hsl(var(--ads-warning))]',
  },
  error: {
    icon: AlertCircle,
    className: 'border-[hsl(var(--ads-danger)/0.3)] bg-[hsl(var(--ads-danger-subtle))] text-[hsl(var(--ads-danger))]',
  },
  loading: {
    icon: LoaderCircle,
    className: 'border-[hsl(var(--ads-info)/0.3)] bg-[hsl(var(--ads-info-subtle))] text-[hsl(var(--ads-info))]',
  },
};

export function InlineFeedback({
  variant = 'info',
  title,
  description,
  action,
  dismissible = false,
  onDismiss,
  live,
  className = '',
  children,
  ...props
}) {
  const config = variants[variant] || variants.info;
  const Icon = config.icon;
  const isUrgent = variant === 'error';

  return (
    <section
      role={isUrgent ? 'alert' : 'status'}
      aria-live={live || (isUrgent ? 'assertive' : 'polite')}
      aria-atomic="true"
      className={join('flex items-start gap-3 rounded-[var(--ads-radius-md)] border px-4 py-3 text-sm', config.className, className)}
      {...props}
    >
      <Icon className={join('mt-0.5 h-5 w-5 shrink-0', variant === 'loading' && 'animate-spin')} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold text-current">{title}</p> : null}
        {description || children ? <div className={join('text-[hsl(var(--ads-text-default))]', title && 'mt-1')}>{description || children}</div> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
      {dismissible && onDismiss ? (
        <IconButton variant="ghost" size="sm" label="ปิดข้อความ" onClick={onDismiss} className="shrink-0 text-current">
          <X aria-hidden="true" />
        </IconButton>
      ) : null}
    </section>
  );
}

export function FieldMessage({ id, variant = 'error', children, className = '' }) {
  if (!children) return null;
  return (
    <p id={id} role={variant === 'error' ? 'alert' : undefined} className={join('text-xs', variant === 'error' ? 'text-[hsl(var(--ads-danger))]' : 'text-[hsl(var(--ads-text-muted))]', className)}>
      {children}
    </p>
  );
}

export function FormErrorSummary({ title = 'กรุณาตรวจสอบข้อมูล', errors = [], className = '' }) {
  if (!errors.length) return null;
  return (
    <InlineFeedback variant="error" title={title} className={className} tabIndex={-1}>
      <ul className="list-disc space-y-1 pl-5">
        {errors.map((error, index) => <li key={error.id || `${error.message}-${index}`}>{error.message || error}</li>)}
      </ul>
    </InlineFeedback>
  );
}
