// src/features/brand/pages/CreateBrandPage.jsx
// Create Brand (store-owned runtime, no direct API calls)

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getRuntimeErrorMessage } from '@/runtime';
import { useBrandStore } from '../store/brandStore';

const CreateBrandPage = () => {
  const navigate = useNavigate();

  const saving = useBrandStore((state) => state.saving);
  const error = useBrandStore((state) => state.error);
  const clearErrorAction = useBrandStore((state) => state.clearErrorAction);
  const createBrandAction = useBrandStore((state) => state.createBrandAction);

  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    clearErrorAction?.();
  }, [clearErrorAction]);

  const nameTrim = String(name || '').trim();
  const nameError = touched && !nameTrim ? 'กรุณากรอกชื่อแบรนด์' : null;

  const returnToList = () => navigate('..');

  const onSubmit = async (event) => {
    event?.preventDefault?.();
    clearErrorAction?.();
    setTouched(true);

    if (!nameTrim || saving) return;

    const result = await createBrandAction?.({ name: nameTrim });
    if (result?.ok) returnToList();
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">เพิ่มแบรนด์</h1>
          <p className="text-sm text-gray-500">สร้างแบรนด์ใหม่สำหรับสาขานี้</p>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{getRuntimeErrorMessage(error)}</div>
        </div>
      ) : null}

      <div className="mt-4 max-w-xl rounded border bg-white p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">ชื่อแบรนด์</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="เช่น Samsung"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={saving}
            />
            {nameError ? <div className="mt-1 text-xs text-red-600">{nameError}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || !nameTrim}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={returnToList}
              disabled={saving}
              className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            >
              ยกเลิก
            </button>
            {saving ? <div className="text-sm text-gray-600">กำลังบันทึก...</div> : null}
          </div>

          <div className="text-xs text-gray-500">
            หมายเหตุ: ระบบจะกันชื่อซ้ำภายในสาขาเดียวกันโดยอัตโนมัติ
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBrandPage;
