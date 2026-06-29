// src/features/settings/pages/FormBranch.jsx
// ✅ FormBranch V2 — Branch/Auth SSoT compatible
// - ไม่ใช้ useAlphaTechStore
// - ไม่ส่ง token เอง
// - ใช้ branchApi + branchStore ปัจจุบัน
// - ใช้ authStore เฉพาะตรวจสิทธิ์
// - รองรับ shopSlug / relative navigation
// - เหมาะสำหรับใช้เป็นฟอร์มเพิ่มสาขาแบบเรียบง่ายในช่วง refactor

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { createBranch, removeBranch } from '../../branch/api/branchApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useBranchStore } from '@/features/branch/store/branchStore';

const initialState = {
  name: '',
  address: '',
  phone: '',
  email: '',
  taxId: '',
  businessType: 'IT',
};

const businessTypeOptions = [
  { value: 'IT', label: 'ไอที/คอมพิวเตอร์' },
  { value: 'ELECTRONICS', label: 'อิเล็กทรอนิกส์' },
  { value: 'CONSTRUCTION', label: 'วัสดุก่อสร้าง' },
  { value: 'GROCERY', label: 'มินิมาร์ท/ของชำ' },
  { value: 'GENERAL', label: 'ทั่วไป' },
];

const FormBranch = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();

  const role = useAuthStore((state) => state.role);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const branches = useBranchStore((state) => state.branches) || [];
  const loadAllBranchesAction = useBranchStore((state) => state.loadAllBranchesAction);

  const [form, setForm] = useState(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  const canSubmit = useMemo(() => {
    return isSuperAdmin && form.name.trim().length > 0;
  }, [isSuperAdmin, form.name]);

  useEffect(() => {
    if (typeof loadAllBranchesAction !== 'function') return;
    loadAllBranchesAction();
  }, [loadAllBranchesAction]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message) setMessage(null);
  };

  const resetForm = () => {
    setForm(initialState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'ต้องเป็น Super Admin เท่านั้นจึงจะเพิ่มสาขาได้' });
      return;
    }

    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'กรุณาระบุชื่อสาขา' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        taxId: form.taxId.trim() || null,
        businessType: form.businessType || 'IT',
      };

      const res = await createBranch(payload);

      setMessage({
        type: 'success',
        text: `เพิ่มสาขา “${res?.data?.name || payload.name}” สำเร็จ`,
      });

      resetForm();

      if (typeof loadAllBranchesAction === 'function') {
        await loadAllBranchesAction();
      }
    } catch (err) {
      console.error('❌ createBranch failed:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'เพิ่มสาขาไม่สำเร็จ',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'ต้องเป็น Super Admin เท่านั้นจึงจะลบสาขาได้' });
      return;
    }

    const branchId = Number(id);
    if (!Number.isFinite(branchId) || branchId <= 0) return;

    try {
      setDeletingId(branchId);
      setMessage(null);

      await removeBranch(branchId);

      setMessage({
        type: 'success',
        text: 'ลบสาขาสำเร็จ',
      });

      if (typeof loadAllBranchesAction === 'function') {
        await loadAllBranchesAction();
      }
    } catch (err) {
      console.error('❌ removeBranch failed:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'ลบสาขาไม่สำเร็จ',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const goBack = () => {
    navigate('..');
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">เพิ่ม / จัดการสาขา</h1>
          <p className="mt-1 text-xs text-gray-500">
            ร้าน: {shopSlug || '-'} • สิทธิ์: {role || '-'}
          </p>
        </div>

        <button
          type="button"
          onClick={goBack}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          กลับ
        </button>
      </div>

      {!isSuperAdmin && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          หน้านี้อนุญาตเฉพาะ Super Admin สำหรับเพิ่ม/ลบสาขา
        </div>
      )}

      {message && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="branch-name" className="mb-1 block text-sm font-medium text-gray-700">
                ชื่อสาขา <span className="text-red-500">*</span>
              </label>
              <input
                id="branch-name"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.name}
                onChange={handleChange}
                placeholder="เช่น สาขาหลัก"
                name="name"
                type="text"
                disabled={!isSuperAdmin || isSaving}
              />
            </div>

            <div>
              <label htmlFor="businessType" className="mb-1 block text-sm font-medium text-gray-700">
                ประเภทธุรกิจ
              </label>
              <select
                id="businessType"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                disabled={!isSuperAdmin || isSaving}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {businessTypeOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                ที่อยู่
              </label>
              <textarea
                id="address"
                className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.address}
                onChange={handleChange}
                placeholder="ที่อยู่สาขา"
                name="address"
                disabled={!isSuperAdmin || isSaving}
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                เบอร์โทร
              </label>
              <input
                id="phone"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.phone}
                onChange={handleChange}
                placeholder="เช่น 02-000-0000"
                name="phone"
                type="text"
                disabled={!isSuperAdmin || isSaving}
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <input
                id="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.email}
                onChange={handleChange}
                placeholder="branch@example.com"
                name="email"
                type="email"
                disabled={!isSuperAdmin || isSaving}
              />
            </div>

            <div>
              <label htmlFor="taxId" className="mb-1 block text-sm font-medium text-gray-700">
                เลขประจำตัวผู้เสียภาษี
              </label>
              <input
                id="taxId"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.taxId}
                onChange={handleChange}
                placeholder="เลขประจำตัวผู้เสียภาษี"
                name="taxId"
                type="text"
                disabled={!isSuperAdmin || isSaving}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={!isSuperAdmin || isSaving}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ล้างฟอร์ม
            </button>

            <button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'กำลังบันทึก...' : '+ เพิ่มสาขา'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">รายการสาขา</h2>
          <span className="text-xs text-gray-500">{branches.length.toLocaleString('th-TH')} รายการ</span>
        </div>

        <div className="divide-y rounded-lg border">
          {branches.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">ไม่มีข้อมูลสาขา</div>
          ) : (
            branches.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-900">{item.name}</div>
                  <div className="truncate text-xs text-gray-500">
                    {[item.address, item.phone, item.email].filter(Boolean).join(' • ') || '-'}
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isSuperAdmin || deletingId === Number(item.id)}
                  onClick={() => handleRemove(item.id)}
                >
                  {deletingId === Number(item.id) ? 'กำลังลบ...' : 'Delete'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FormBranch;
