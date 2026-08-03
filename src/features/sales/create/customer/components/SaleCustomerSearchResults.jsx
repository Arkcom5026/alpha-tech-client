import React from 'react';

const SaleCustomerSearchResults = ({
  results,
  selectedCustomerId,
  loading,
  onSelect,
}) => {
  if (results.length === 0) return null;

  return (
    <div className="mb-2 max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-1.5 shadow-inner animate-fadeIn">
      {results.map((customer) => {
        const displayLabel =
          customer.type === 'ORGANIZATION' || customer.type === 'GOVERNMENT'
            ? customer.companyName || customer.name || '-'
            : customer.name || customer.companyName || '-';
        const details = [customer.phone, customer.email, customer.taxId]
          .filter(Boolean)
          .join(' · ');

        return (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer)}
            disabled={loading}
            className={`block w-full rounded-lg border px-3 py-2 text-left transition-all ${
              selectedCustomerId === customer.id
                ? 'border-slate-900 bg-slate-100 text-slate-900'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="truncate text-[11px] font-black">{displayLabel}</div>
            {details ? <div className="mt-0.5 truncate text-[9px] font-bold text-slate-400">{details}</div> : null}
          </button>
        );
      })}
    </div>
  );
};

export default SaleCustomerSearchResults;
