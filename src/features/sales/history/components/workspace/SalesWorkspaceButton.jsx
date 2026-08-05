import React from 'react';

const SalesWorkspaceButton = ({ children, onClick, disabled = false, variant = 'secondary', type = 'button' }) => {
  const variants = {
    primary: 'border-teal-700 bg-teal-700 text-white hover:border-teal-800 hover:bg-teal-800',
    secondary: 'border-slate-300 bg-white text-slate-800 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-900',
    quiet: 'border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.secondary}`}
    >
      {children}
    </button>
  );
};

export default SalesWorkspaceButton;
