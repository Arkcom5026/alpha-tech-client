// src/features/settings/pages/ListBranchPage.jsx
// ✅ Branch/Auth SSoT cleanup:
// - authStore.employee.branchId = branchId ของผู้ login
// - branchStore = รายการ/รายละเอียดสาขา
// - employeeStore ไม่ใช่แหล่งข้อมูล branch/token/role แล้ว
// - ใช้ relative navigation เพื่อไม่ผูก path กับ /:shopSlug ตรง ๆ

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuthStore } from '@/features/auth/store/authStore.js';
import { useBranchStore } from '@/features/branch/store/branchStore';
import AddressDisplay from '@/features/address/components/AddressDisplay';

const businessTypeTh = (bt) => {
  const key = String(bt || '').toUpperCase();

  switch (key) {
    case 'IT':
      return 'ไอที/คอมพิวเตอร์';
    case 'ELECTRONICS':
      return 'อิเล็กทรอนิกส์';
    case 'CONSTRUCTION':
      return 'วัสดุก่อสร้าง';
    case 'GROCERY':
      return 'มินิมาร์ท/ของชำ';
    case 'GENERAL':
      return 'ทั่วไป';
    default:
      return key || '-';
  }
};

const BusinessTypeBadge = ({ value }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
    {businessTypeTh(value)}
  </span>
);

const FeaturesBadge = ({ features }) => {
  const mode = features?.mode;
  const sn = features?.trackSerialNumber === true;
  const templ = features?.enableTemplates !== false; // default true

  return (
    <div className="flex flex-wrap gap-1 text-xs">
      {mode && (
        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">
          โหมด: {mode}
        </span>
      )}

      <span
        className={`px-2 py-0.5 rounded border ${
          sn
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-gray-100 border-gray-200 text-gray-600'
        }`}
      >
        SN: {sn ? 'ติดตาม' : 'ไม่ติดตาม'}
      </span>

      <span
        className={`px-2 py-0.5 rounded border ${
          templ
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-gray-100 border-gray-200 text-gray-600'
        }`}
      >
        Template: {templ ? 'เปิด' : 'ปิด'}
      </span>
    </div>
  );
};

const ListBranchPage = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate();

  const branches = useBranchStore((state) => state.branches) || [];
  const loadAllBranchesAction = useBranchStore((state) => state.loadAllBranchesAction);

  // 🔐 RBAC / Session SSoT
  const role = useAuthStore((s) => s.role);
  const authBranchId = useAuthStore((s) => s.employee?.branchId);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  const currentBranchId = useMemo(() => {
    const n = Number(authBranchId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [authBranchId]);

  useEffect(() => {
    if (typeof loadAllBranchesAction !== 'function') return;
    loadAllBranchesAction();
  }, [loadAllBranchesAction]);

  const visibleBranches = useMemo(() => {
    if (isSuperAdmin) return branches;
    if (!currentBranchId) return [];

    return branches.filter((b) => Number(b?.id) === Number(currentBranchId));
  }, [branches, isSuperAdmin, currentBranchId]);

  const goCreate = () => {
    if (!isSuperAdmin) return;

    // ✅ relative from /:shopSlug/pos/settings/branches
    navigate('create');
  };

  const goEdit = (branchId) => {
    if (!isSuperAdmin) return;

    const id = Number(branchId);
    if (!Number.isFinite(id) || id <= 0) return;

    // ✅ relative from /:shopSlug/pos/settings/branches
    navigate(`edit/${id}`);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">จัดการสาขา</h1>
          <p className="mt-1 text-xs text-gray-500">
            ร้าน: {shopSlug || '-'} • สิทธิ์: {role || '-'}
            {!isSuperAdmin && currentBranchId ? ` • สาขาปัจจุบัน: ${currentBranchId}` : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={goCreate}
          className={`px-4 py-2 rounded text-white ${
            isSuperAdmin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!isSuperAdmin}
          aria-disabled={!isSuperAdmin}
          title={isSuperAdmin ? 'เพิ่มสาขาใหม่' : 'ต้องเป็น Super Admin'}
        >
          + เพิ่มสาขา
        </button>
      </div>

      <div className="overflow-x-auto md:overflow-visible">
        <table className="min-w-full bg-white border border-gray-200">
          <colgroup>
            <col className="w-[200px]" />
            <col className="w-[110px]" />
            <col className="w-[340px]" />
            <col className="w-[400px]" />
            <col className="w-[110px]" />
            <col className="w-[90px]" />
          </colgroup>

          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2 border-b w-[200px]">ชื่อสาขา</th>
              <th className="text-left px-4 py-2 border-b w-[120px]">ประเภทสาขา</th>
              <th className="text-left px-4 py-2 border-b w-[340px]">คุณสมบัติ (Features)</th>
              <th className="text-left px-4 py-2 border-b w-[400px]">ที่อยู่</th>
              <th className="text-left px-4 py-2 border-b w-[110px]">เบอร์โทร</th>
              <th className="text-center px-4 py-2 border-b w-[90px]">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {visibleBranches.map((branch) => (
              <tr key={branch.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap font-medium">{branch.name}</td>

                <td className="px-4 py-2 whitespace-nowrap">
                  <BusinessTypeBadge value={branch.businessType} />
                </td>

                <td className="px-4 py-2 align-top min-w-[340px]">
                  <FeaturesBadge features={branch.features} />
                </td>

                <td className="px-4 py-2 text-sm text-gray-700 align-middle">
                  <div
                    className="max-w-[400px] truncate"
                    title={[branch.address, branch.fullAddress].filter(Boolean).join(' ')}
                  >
                    <AddressDisplay
                      addressString={[branch.address, branch.fullAddress].filter(Boolean).join(' ')}
                      fallback={{
                        address: branch.address,
                        subdistrictName: branch.subdistrictName,
                        districtName: branch.districtName,
                        provinceName: branch.provinceName,
                        subdistrictCode: branch.subdistrictCode,
                        districtCode: branch.districtCode,
                        provinceCode: branch.provinceCode,
                        postalCode: branch.postalCode,
                      }}
                    />
                  </div>
                </td>

                <td className="px-4 py-2 whitespace-nowrap">{branch.phone || '-'}</td>

                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => goEdit(branch.id)}
                    className={`${
                      isSuperAdmin ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!isSuperAdmin}
                    aria-disabled={!isSuperAdmin}
                    title={isSuperAdmin ? 'แก้ไขสาขา' : 'ต้องเป็น Super Admin'}
                  >
                    แก้ไข
                  </button>
                </td>
              </tr>
            ))}

            {visibleBranches.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  ไม่มีข้อมูลสาขา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBranchPage;
