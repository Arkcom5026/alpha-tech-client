import React from 'react';

const SaleCustomerSearchResults = ({
  results,
  selectedCustomerId,
  loading,
  onSelect,
}) => {
  if (results.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-teal-100 bg-teal-50/40 p-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-700">ผลการค้นหา</p>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-teal-800">
          {results.length} ราย
        </span>
      </div>
      <div className="max-h-52 space-y-2 overflow-y-auto">
        {results.map((customer) => {
          const displayLabel =
            customer.type === 'ORGANIZATION' || customer.type === 'GOVERNMENT'
              ? customer.companyName || customer.name || '-'
              : customer.name || customer.companyName || '-';
          const details = [customer.phone, customer.email, customer.taxId]
            .filter(Boolean)
            .join(' · ');
          const active = selectedCustomerId === customer.id;

          return (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelect(customer)}
              disabled={loading}
              className={`block min-h-14 w-full rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                active
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
              }`}
            >
              <div className="truncate text-sm font-semibold">{displayLabel}</div>
              {details ? <div className="mt-1 truncate text-xs text-slate-500">{details}</div> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SaleCustomerSearchResults;
