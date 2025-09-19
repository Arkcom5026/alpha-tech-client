import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from '@/features/auth/store/authStore.js';
import { useBranchStore } from "../store/branchStore";
import AddressDisplay from "@/features/address/components/AddressDisplay";

const businessTypeTh = (bt) => {
  const key = String(bt || '').toUpperCase();
  switch (key) {
    case 'IT': return 'ไอที/คอมพิวเตอร์';
    case 'ELECTRONICS': return 'อิเล็กทรอนิกส์';
    case 'CONSTRUCTION': return 'วัสดุก่อสร้าง';
    case 'GROCERY': return 'มินิมาร์ท/ของชำ';
    case 'GENERAL': return 'ทั่วไป';
    default: return key || '-';
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
        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">โหมด: {mode}</span>
      )}
      <span className={`px-2 py-0.5 rounded border ${sn ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
        SN: {sn ? 'ติดตาม' : 'ไม่ติดตาม'}
      </span>
      <span className={`px-2 py-0.5 rounded border ${templ ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
        Template: {templ ? 'เปิด' : 'ปิด'}
      </span>
    </div>
  );
};

const ListBranchPage = () => {
  const navigate = useNavigate();
  const branches = useBranchStore((state) => state.branches) || [];
  const loadAllBranchesAction = useBranchStore((state) => state.loadAllBranchesAction);

  // 🔐 RBAC
  const role = useAuthStore((s) => s.role);
  const currentBranchId = useAuthStore((s) => s.branchId);
  const isSuperAdmin = String(role || '').toLowerCase() === 'superadmin';

  useEffect(() => {
    loadAllBranchesAction();
  }, [loadAllBranchesAction]);

  const visibleBranches = useMemo(() => {
    // ปลอดภัยไว้ก่อน: ถ้าไม่ใช่ superadmin แสดงเฉพาะสาขาที่ login
    return isSuperAdmin ? branches : branches.filter((b) => b?.id === currentBranchId);
  }, [branches, isSuperAdmin, currentBranchId]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">จัดการสาขา</h1>
        <button
          onClick={() => isSuperAdmin && navigate("/pos/settings/branches/create")}
          className={`px-4 py-2 rounded text-white ${isSuperAdmin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
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
                <td className="px-4 py-2 align-top min-w-[340px]"><FeaturesBadge features={branch.features} /></td>
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
                    onClick={() => isSuperAdmin && navigate(`/pos/settings/branches/edit/${branch.id}`)}
                    className={`${isSuperAdmin ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
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



