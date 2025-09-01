
// --- filepath: src/features/position/components/PositionForm.jsx
import { useEffect, useMemo, useRef, useState } from 'react';

const PositionForm = ({
  initialValues = { name: '', description: '' },
  onSubmit,
  onCancel,
  submitting = false,
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

  const canSubmit = useMemo(() => {
    const nm = String(name || '').trim();
    return nm.length > 0 && !submitting;
  }, [name, submitting]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    onSubmit?.({ name: String(name).trim(), description: String(description || '').trim() || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">ชื่อตำแหน่ง <span className="text-rose-600">*</span></label>
        <input
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900"
          placeholder="เช่น ผู้ดูแลระบบ"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
        <textarea
          className="w-full border border-zinc-300 dark:border-zinc-700 rounded-md px-3 py-2 bg-white dark:bg-zinc-900 min-h-[96px]"
          placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={onCancel} disabled={submitting}>ยกเลิก</button>
        <button type="submit" disabled={!canSubmit} className="px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50">{submitting ? 'กำลังบันทึก...' : 'บันทึก'}</button>
      </div>
    </form>
  );
};

export default PositionForm;