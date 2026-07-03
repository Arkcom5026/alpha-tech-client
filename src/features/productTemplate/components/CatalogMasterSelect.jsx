import React from 'react';

const normalize = (value) => String(value || '').trim().toLowerCase();

const CatalogMasterSelect = ({
  label,
  required = false,
  value,
  options = [],
  onChange,
  placeholder,
  disabled = false,
  helperText,
}) => {
  const [query, setQuery] = React.useState('');

  const sortedOptions = React.useMemo(() => {
    const q = normalize(query);
    return [...options]
      .filter((item) => {
        if (!q) return true;
        return normalize(item?.name).includes(q) || String(item?.id || '').includes(q);
      })
      .sort((a, b) => normalize(a?.name).localeCompare(normalize(b?.name), 'th'));
  }, [options, query]);

  return (
    <label className="space-y-2">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
        {label}{required ? ' *' : ''}
      </span>
      <div className="rounded-2xl border border-slate-200 bg-white p-2 transition-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-200">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${label}...`}
          disabled={disabled}
          className="mb-2 min-h-9 w-full rounded-xl border border-slate-100 px-3 text-xs font-semibold outline-none disabled:bg-slate-50"
        />
        <select
          value={value || ''}
          onChange={(event) => onChange?.(event.target.value)}
          required={required}
          disabled={disabled}
          className="min-h-10 w-full rounded-xl border border-slate-100 px-3 text-sm font-bold text-slate-700 outline-none disabled:bg-slate-50"
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {sortedOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · ID {item.id}{item.branchId ? ` · Branch ${item.branchId}` : ''}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[11px] font-semibold text-slate-400">
        {helperText || `${sortedOptions.length} option${sortedOptions.length === 1 ? '' : 's'} available`}
      </p>
    </label>
  );
};

export default CatalogMasterSelect;
