const VARIANTS = {
  primary: 'border-teal-700 bg-teal-700 text-white hover:border-teal-800 hover:bg-teal-800',
  secondary: 'border-slate-300 bg-white text-slate-800 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900',
  danger: 'border-rose-700 bg-rose-700 text-white hover:border-rose-800 hover:bg-rose-800',
};

const StockWorkspaceButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  type = 'button',
  className = '',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
  >
    {children}
  </button>
);

export default StockWorkspaceButton;
