import * as React from 'react';

const join = (...values) => values.filter(Boolean).join(' ');

const controlSize = {
  sm: 'h-[var(--ads-control-sm)] text-xs',
  md: 'h-[var(--ads-control-md)] text-sm',
  lg: 'h-[var(--ads-control-lg)] text-base',
};

const buttonTone = {
  primary:
    'bg-[hsl(var(--ads-brand))] text-[hsl(var(--ads-brand-foreground))] hover:bg-[hsl(var(--ads-brand-hover))]',
  secondary:
    'border border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-base))] text-[hsl(var(--ads-text-default))] hover:bg-[hsl(var(--ads-surface-subtle))]',
  danger: 'bg-[hsl(var(--ads-danger))] text-white hover:brightness-95',
  ghost:
    'text-[hsl(var(--ads-text-default))] hover:bg-[hsl(var(--ads-surface-subtle))]',
};

const fieldControlClass =
  'w-full rounded-[var(--ads-radius-md)] border bg-[hsl(var(--ads-surface-base))] text-[hsl(var(--ads-text-default))] shadow-[var(--ads-shadow-xs)] outline-none transition duration-[var(--ads-motion-fast)] placeholder:text-[hsl(var(--ads-text-muted))] focus:border-[hsl(var(--ads-focus))] focus:ring-2 focus:ring-[hsl(var(--ads-focus)/0.16)] disabled:cursor-not-allowed disabled:opacity-60';

export const Spinner = ({
  size = 'md',
  label = 'กำลังโหลด',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-9 w-9 border-[3px]',
  };

  return (
    <span
      role="status"
      aria-label={label}
      className={join(
        'inline-block animate-spin rounded-full border-current border-r-transparent',
        sizes[size],
        className,
      )}
      {...props}
    />
  );
};

export const Button = React.forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    loadingLabel,
    disabled,
    type = 'button',
    className = '',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={join(
        'inline-flex select-none items-center justify-center gap-2 rounded-[var(--ads-radius-md)] px-4 font-medium shadow-[var(--ads-shadow-xs)] transition duration-[var(--ads-motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ads-focus))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        controlSize[size],
        buttonTone[variant] || buttonTone.primary,
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" aria-hidden="true" /> : null}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
});

export const IconButton = React.forwardRef(function IconButton(
  { label, className = '', children, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={props.title || label}
      className={join('aspect-square px-0 [&_svg]:h-4 [&_svg]:w-4', className)}
      {...props}
    >
      {children}
    </Button>
  );
});

export const Input = React.forwardRef(function Input(
  { invalid = false, size = 'md', className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={join(
        fieldControlClass,
        'px-3',
        invalid
          ? 'border-[hsl(var(--ads-danger))]'
          : 'border-[hsl(var(--ads-border-default))]',
        controlSize[size],
        className,
      )}
      {...props}
    />
  );
});

export const Select = React.forwardRef(function Select(
  {
    invalid = false,
    size = 'md',
    placeholder,
    children,
    className = '',
    ...props
  },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={join(
        fieldControlClass,
        'appearance-none bg-[linear-gradient(45deg,transparent_50%,hsl(var(--ads-text-muted))_50%),linear-gradient(135deg,hsl(var(--ads-text-muted))_50%,transparent_50%)] bg-[position:calc(100%-16px)_50%,calc(100%-11px)_50%] bg-[size:5px_5px,5px_5px] bg-no-repeat px-3 pr-10',
        invalid
          ? 'border-[hsl(var(--ads-danger))]'
          : 'border-[hsl(var(--ads-border-default))]',
        controlSize[size],
        className,
      )}
      {...props}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {children}
    </select>
  );
});

export const Textarea = React.forwardRef(function Textarea(
  { invalid = false, className = '', ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={join(
        fieldControlClass,
        'min-h-24 resize-y px-3 py-2 text-sm',
        invalid
          ? 'border-[hsl(var(--ads-danger))]'
          : 'border-[hsl(var(--ads-border-default))]',
        className,
      )}
      {...props}
    />
  );
});

export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  className = '',
  children,
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={join('space-y-1.5', className)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[hsl(var(--ads-text-strong))]"
        >
          {label}
          {required ? (
            <span className="ml-1 text-[hsl(var(--ads-danger))]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            id: children.props.id || id,
            invalid: children.props.invalid ?? Boolean(error),
            'aria-describedby':
              children.props['aria-describedby'] || errorId || hintId,
            'aria-required': required || undefined,
          })
        : children}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-[hsl(var(--ads-danger))]">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-[hsl(var(--ads-text-muted))]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const badgeTone = {
  neutral:
    'border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-subtle))] text-[hsl(var(--ads-text-default))]',
  brand:
    'border-transparent bg-[hsl(var(--ads-brand)/0.12)] text-[hsl(var(--ads-brand))]',
  success:
    'border-transparent bg-[hsl(var(--ads-success-subtle))] text-[hsl(var(--ads-success))]',
  warning:
    'border-transparent bg-[hsl(var(--ads-warning-subtle))] text-[hsl(var(--ads-warning))]',
  danger:
    'border-transparent bg-[hsl(var(--ads-danger-subtle))] text-[hsl(var(--ads-danger))]',
  info:
    'border-transparent bg-[hsl(var(--ads-info-subtle))] text-[hsl(var(--ads-info))]',
};

export function Badge({ tone = 'neutral', className = '', ...props }) {
  return (
    <span
      className={join(
        'inline-flex items-center rounded-[var(--ads-radius-full)] border px-2.5 py-1 text-xs font-semibold leading-none',
        badgeTone[tone] || badgeTone.neutral,
        className,
      )}
      {...props}
    />
  );
}

export function Page({ className = '', ...props }) {
  return (
    <main
      className={join(
        'min-h-full bg-[hsl(var(--ads-surface-canvas))] px-4 py-5 text-[hsl(var(--ads-text-default))] sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    />
  );
}

export function PageHeader({ title, description, actions, className = '' }) {
  return (
    <header
      className={join(
        'mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--ads-text-strong))]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--ads-text-muted))]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Stack({
  as: Component = 'div',
  direction = 'column',
  gap = 4,
  wrap = false,
  className = '',
  ...props
}) {
  const gaps = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <Component
      className={join(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        gaps[gap] || 'gap-4',
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    />
  );
}

export function Card({ as: Component = 'section', className = '', ...props }) {
  return (
    <Component
      className={join(
        'rounded-[var(--ads-radius-lg)] border border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-raised))] shadow-[var(--ads-shadow-sm)]',
        className,
      )}
      {...props}
    />
  );
}

export const CardHeader = ({ className = '', ...props }) => (
  <div
    className={join(
      'border-b border-[hsl(var(--ads-border-default))] px-5 py-4',
      className,
    )}
    {...props}
  />
);

export const CardBody = ({ className = '', ...props }) => (
  <div className={join('px-5 py-4', className)} {...props} />
);

export const CardFooter = ({ className = '', ...props }) => (
  <div
    className={join(
      'flex flex-wrap items-center justify-end gap-2 border-t border-[hsl(var(--ads-border-default))] px-5 py-4',
      className,
    )}
    {...props}
  />
);

const alertTone = {
  info:
    'border-[hsl(var(--ads-info)/0.3)] bg-[hsl(var(--ads-info-subtle))] text-[hsl(var(--ads-info))]',
  success:
    'border-[hsl(var(--ads-success)/0.3)] bg-[hsl(var(--ads-success-subtle))] text-[hsl(var(--ads-success))]',
  warning:
    'border-[hsl(var(--ads-warning)/0.3)] bg-[hsl(var(--ads-warning-subtle))] text-[hsl(var(--ads-warning))]',
  danger:
    'border-[hsl(var(--ads-danger)/0.3)] bg-[hsl(var(--ads-danger-subtle))] text-[hsl(var(--ads-danger))]',
};

export function Alert({ title, children, tone = 'info', className = '', ...props }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={join(
        'rounded-[var(--ads-radius-md)] border px-4 py-3 text-sm',
        alertTone[tone] || alertTone.info,
        className,
      )}
      {...props}
    >
      {title ? <div className="font-semibold">{title}</div> : null}
      {children ? <div className={title ? 'mt-1' : ''}>{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title = 'ยังไม่มีข้อมูล',
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={join(
        'flex min-h-56 flex-col items-center justify-center rounded-[var(--ads-radius-lg)] border border-dashed border-[hsl(var(--ads-border-strong))] bg-[hsl(var(--ads-surface-base))] px-6 py-10 text-center',
        className,
      )}
    >
      {icon ? <div className="mb-3 text-[hsl(var(--ads-text-muted))]">{icon}</div> : null}
      <h2 className="text-base font-semibold text-[hsl(var(--ads-text-strong))]">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-[hsl(var(--ads-text-muted))]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = 'ไม่สามารถโหลดข้อมูลได้',
  description = 'กรุณาลองใหม่อีกครั้ง',
  actionLabel = 'ลองใหม่',
  onAction,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={join(
        'flex min-h-48 flex-col items-center justify-center rounded-[var(--ads-radius-lg)] border border-[hsl(var(--ads-danger)/0.25)] bg-[hsl(var(--ads-danger-subtle))] px-6 py-8 text-center',
        className,
      )}
    >
      <h2 className="text-base font-semibold text-[hsl(var(--ads-danger))]">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-[hsl(var(--ads-text-muted))]">
          {description}
        </p>
      ) : null}
      {onAction ? (
        <Button variant="secondary" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingState({ label = 'กำลังโหลดข้อมูล…', className = '' }) {
  return (
    <div
      className={join(
        'flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-[hsl(var(--ads-text-muted))]',
        className,
      )}
    >
      <Spinner size="lg" />
      <span>{label}</span>
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeLabel = 'ปิด',
  className = '',
}) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;

    const previousActiveElement = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = panelRef.current?.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previousActiveElement?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--ads-surface-overlay)/0.58)] p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={join(
          'max-h-[min(90vh,48rem)] w-full overflow-hidden rounded-t-[var(--ads-radius-lg)] border border-[hsl(var(--ads-border-default))] bg-[hsl(var(--ads-surface-raised))] text-[hsl(var(--ads-text-default))] shadow-[var(--ads-shadow-md)] sm:max-w-lg sm:rounded-[var(--ads-radius-lg)]',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[hsl(var(--ads-border-default))] px-5 py-4">
          <div className="min-w-0">
            {title ? (
              <h2 id={titleId} className="text-lg font-semibold text-[hsl(var(--ads-text-strong))]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-[hsl(var(--ads-text-muted))]">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            label={closeLabel}
            onClick={onClose}
            className="shrink-0"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </IconButton>
        </header>
        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[hsl(var(--ads-border-default))] px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
