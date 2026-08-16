
// --- filepath: src/features/position/components/PositionForm.jsx
import { useEffect, useMemo, useRef, useState } from 'react';

const PositionForm = ({
  initialValues = { name: '', description: '' },
  onSubmit,
  onCancel,
  submitting = false,
  mutationOwnedRef,
  error = null,
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const prevInitial = useRef(initialValues);

  // update state when initialValues prop changes
  useEffect(() => {
    if (
      prevInitial.current.name !== initialValues.name ||
      prevInitial.current.description !== initialValues.description
    ) {
      setName(initialValues?.name || '');
      setDescription(initialValues?.description || '');
      prevInitial.current = initialValues;
    }
  }, [initialValues]);

  const mutationBusy = submitting || Boolean(mutationOwnedRef?.current);
  const canSubmit = useMemo(() => {
    const nm = String(name || '').trim();
    return nm.length > 0 && !submitting;
  }, [name, submitting]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit || mutationOwnedRef?.current) return;
    onSubmit?.({ name: String(name).trim(), description: String(description || '').trim() || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={mutationBusy}>
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">ชื่อตำแหน่ง <span className="text-rose-600">*</span></label>
        <input
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="เช่น ผู้ดูแลระบบ"
          value={name}
          onChange={(e) => {
            if (!mutationOwnedRef?.current) setName(e.target.value);
          }}
          disabled={mutationBusy}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
        <textarea
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 min-h-[96px] outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-950/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
          value={description}
          onChange={(e) => {
            if (!mutationOwnedRef?.current) setDescription(e.target.value);
          }}
          disabled={mutationBusy}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={onCancel} disabled={mutationBusy}>ยกเลิก</button>
        <button type="submit" disabled={!canSubmit || mutationBusy} className="px-3 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50">{mutationBusy ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </div>
    </form>
  );
};

export default PositionForm;