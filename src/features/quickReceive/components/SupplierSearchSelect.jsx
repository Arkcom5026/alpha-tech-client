
// =============================================================================
// File: src/features/quickReceive/components/SupplierSearchSelect.jsx
// =============================================================================
import React from 'react';
import { Button } from '@/components/ui/button';

/**
 * SupplierSearchSelect — Pure dropdown (no direct API calls)
 * Props:
 *  - value: { id:number, name:string } | null
 *  - onChange: (supplier|null) => void
 *  - options?: Array<{ id:number, name:string }>
 *  - loading?: boolean
 *  - error?: string
 *  - onReload?: () => void
 */
const SupplierSearchSelect = ({ value, onChange, options = [], loading = false, error = '', onReload }) => {
  const handleSelect = (e) => {
    const id = Number(e.target.value || 0);
    const sel = (options || []).find((o) => o.id === id) || null;
    onChange?.(sel);
  };

  const handleClear = () => {
    onChange?.(null);
  };

  return (
    <div className="flex gap-2 items-center">
      <select
        className="w-[240px] border rounded px-2 py-2"
        value={value?.id || ''}
        onChange={handleSelect}
        disabled={loading}
      >
        <option value="">— เลือกซัพพลายเออร์ —</option>
        {(options || []).map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      {value ? (
        <Button variant="outline" type="button" onClick={handleClear}>ล้าง</Button>
      ) : (
        <Button
          variant="outline"
          type="button"
          onClick={onReload ? () => onReload() : undefined}
          disabled={loading || !onReload}
        >
          รีเฟรช
        </Button>
      )}
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  );
};

export default SupplierSearchSelect;





