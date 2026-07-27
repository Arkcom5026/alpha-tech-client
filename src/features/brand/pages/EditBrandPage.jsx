// src/features/brand/pages/EditBrandPage.jsx
// Edit Brand (store-owned runtime, no direct API calls)

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { confirmation, getRuntimeErrorMessage } from '@/runtime';
import { useBrandStore } from '../store/brandStore';

export const normalizeEditBrandActive = (brand) => brand?.isActive ?? brand?.active ?? true;
export const buildEditBrandToggleConfirmationKey = (brandId) => `brand.edit.toggleActive.${brandId}`;

const EditBrandPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const items = useBrandStore((state) => state.items) || [];
  const loading = useBrandStore((state) => state.loading) || false;
  const saving = useBrandStore((state) => state.saving) || false;
  const error = useBrandStore((state) => state.error);
  const clearErrorAction = useBrandStore((state) => state.clearErrorAction);
  const fetchBrandsAction = useBrandStore((state) => state.fetchBrandsAction);
  const updateBrandAction = useBrandStore((state) => state.updateBrandAction);
  const toggleBrandActiveAction = useBrandStore((state) => state.toggleBrandActiveAction);

  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const numericId = useMemo(() => {
    const value = Number(id);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [id]);

  const existing = useMemo(() => {
    if (!numericId) return null;
    return items.find((item) => String(item?.id) === String(numericId)) || null;
  }, [items, numericId]);

  useEffect(() => {
    clearErrorAction?.();
  }, [clearErrorAction]);

  useEffect(() => {
    if (!numericId || existing || loading) return;
    void fetchBrandsAction?.({ includeInactive: true, page: 1 });
  }, [existing, fetchBrandsAction, loading, numericId]);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name || '');
    setTouched(false);
  }, [existing]);

  const nameTrim = String(name || '').trim();
  const nameError = touched && !nameTrim ? 'กรุณากรอกชื่อแบรนด์' : null;
  const active = normalizeEditBrandActive(existing);
  const notFound = Boolean(numericId && !existing && !loading);

  const returnToList = () => navigate('..');

  const onSubmit = async (event) => {
    event?.preventDefault?.();
    clearErrorAction?.();
    setTouched(true);

    if (!numericId || !nameTrim || saving) return;

    const result = await updateBrandAction?.({ id: numericId, name: nameTrim });
    if (result?.ok) returnToList();
  };

  const onToggle = async () => {
    if (!existing?.id || saving) return;

    const nextActive = !active;
    const key = buildEditBrandToggleConfirmationKey(existing.id);
    setPendingConfirmation({
      key,
      title: nextActive ? 'ยืนยันการเปิดใช้งานแบรนด์' : 'ยืนยันการปิดใช้งานแบรนด์',
      message: `ต้องการ${nextActive ? 'เปิด' : 'ปิด'}ใช้งานแบรนด์ “${existing.name || '-'}” หรือไม่?`,
    });

    const accepted = await confirmation.confirm({ key });
    if (!accepted) {
      setPendingConfirmation((current) => (current?.key === key ? null : current));
      return;
    }

    try {
      clearErrorAction?.();
      await toggleBrandActiveAction?.({ id: existing.id, isActive: nextActive });
    } finally {
      setPendingConfirmation((current) => (current?.key === key ? null : current));
    }
  };

  const cancelConfirmation = () => {
    if (pendingConfirmation?.key) confirmation.cancel(pendingConfirmation.key);
  };

  const acceptConfirmation = () => {
    if (pendingConfirmation?.key) confirmation.resolve(pendingConfirmation.key, true);
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">แก้ไขแบรนด์</h1>
          <p className="text-sm text-gray-500">อัปเดตชื่อแบรนด์หรือสถานะการใช้งาน</p>
        </div>
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">เกิดข้อผิดพลาด</div>
          <div className="mt-1 break-words">{getRuntimeErrorMessage(error)}</div>
        </div>
      ) : null}

      {notFound ? (
        <div className="mt-4 max-w-xl rounded border bg-white p-4">
          <div className="text-sm text-gray-700">ไม่พบแบรนด์ที่ต้องการแก้ไข</div>
          <button type="button" onClick={returnToList} className="mt-3 rounded border px-4 py-2 text-sm hover:bg-gray-50">
            กลับ
          </button>
        </div>
      ) : (
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
                disabled={!existing || saving}
              />
              {nameError ? <div className="mt-1 text-xs text-red-600">{nameError}</div> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={saving || !existing || !nameTrim}
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
              <button
                type="button"
                onClick={() => void onToggle()}
                disabled={saving || !existing}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
              </button>

              {saving ? <div className="text-sm text-gray-600">กำลังบันทึก...</div> : null}
              {loading && !existing ? <div className="text-sm text-gray-600">กำลังโหลดข้อมูล...</div> : null}
            </div>

            {existing ? (
              <div className="text-xs text-gray-500">
                สถานะปัจจุบัน: <span className="font-medium">{active ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
              </div>
            ) : null}
          </form>
        </div>
      )}

      {pendingConfirmation ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div>
            <div className="text-sm font-semibold text-amber-900">{pendingConfirmation.title}</div>
            <div className="mt-1 text-sm text-amber-800">{pendingConfirmation.message}</div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelConfirmation}
              className="rounded border border-amber-300 px-3 py-1.5 text-sm text-amber-900"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={acceptConfirmation}
              className="rounded bg-blue-700 px-3 py-1.5 text-sm font-medium text-white"
            >
              ยืนยัน
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EditBrandPage;
