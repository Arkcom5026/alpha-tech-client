import React from 'react';

const SaleCustomerSearchResults = ({
  searchMode,
  results,
  selectedCustomerId,
  loading,
  onSelect,
}) => {
  if (searchMode !== 'name' || results.length === 0) return null;

  return (
    <div className="mb-2 border border-slate-200 rounded-xl p-1.5 bg-slate-50 max-h-32 overflow-y-auto space-y-1 shadow-inner animate-fadeIn">
      {results.map((customer) => {
        const displayLabel =
          customer.type === 'ORGANIZATION' || customer.type === 'GOVERNMENT'
            ? customer.companyName || customer.name || '-'
            : customer.name || customer.companyName || '-';

        return (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer)}
            disabled={loading}
            className={`block w-full text-left px-4 py-2 border rounded-md transition-all text-[11px] font-bold ${
              selectedCustomerId === customer.id
                ? 'border-slate-900 bg-slate-100 text-slate-900 font-black'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
          >
            <div className="truncate">{displayLabel}</div>
          </button>
        );
      })}
    </div>
  );
};

export default SaleCustomerSearchResults;
