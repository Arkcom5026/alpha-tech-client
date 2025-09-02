
// =============================================================
// File: src/features/address/components/AddressCascader.jsx
// Desc: 3-level cascading selects (Province → District → Subdistrict)
// Props:
//  - value: { provinceCode, districtCode, subdistrictCode }
//  - onChange: (next: { provinceCode, districtCode, subdistrictCode, postalCode }) => void
//  - disabled, required, className
//  - labels?: { province?: string, district?: string, subdistrict?: string }
//  - placeholders?: { province?: string, district?: string, subdistrict?: string }
// Notes:
//  - Auto-loads children and propagates postalCode from selected subdistrict
// =============================================================

import { useEffect } from 'react';
import { useAddressStore } from '@/features/address/store/addressStore';

const toStr = (v) => (v == null ? '' : String(v));

const AddressCascader = ({
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  labels = {},
  placeholders = {},
}) => {
  const {
    provinces,
    ensureProvincesAction,
    fetchDistrictsAction,
    fetchSubdistrictsAction,
    getDistrictsByProvince,
    getSubdistrictsByDistrict,
  } = useAddressStore();

  const provinceCode = toStr(value?.provinceCode);
  const districtCode = toStr(value?.districtCode);
  const subdistrictCode = toStr(value?.subdistrictCode);

  // Load provinces at mount
  useEffect(() => {
    void ensureProvincesAction();
  }, [ensureProvincesAction]);

  // When province changes (externally or by user) → ensure districts
  useEffect(() => {
    if (provinceCode) void fetchDistrictsAction(provinceCode);
  }, [provinceCode, fetchDistrictsAction]);

  // When district changes → ensure subdistricts
  useEffect(() => {
    if (districtCode) void fetchSubdistrictsAction(districtCode);
  }, [districtCode, fetchSubdistrictsAction]);

  const districts = getDistrictsByProvince(provinceCode);
  const subdistricts = getSubdistrictsByDistrict(districtCode);

  const handleProvinceChange = (e) => {
    const nextProvince = toStr(e.target.value);
    onChange?.({ provinceCode: nextProvince, districtCode: '', subdistrictCode: '', postalCode: '' });
  };

  const handleDistrictChange = (e) => {
    const nextDistrict = toStr(e.target.value);
    onChange?.({ provinceCode, districtCode: nextDistrict, subdistrictCode: '', postalCode: '' });
  };

  const handleSubdistrictChange = (e) => {
    const nextSubdistrict = toStr(e.target.value);
    const found = subdistricts.find((x) => String(x.code) === nextSubdistrict);
    const postalCode = found?.postcode ? String(found.postcode) : '';
    onChange?.({ provinceCode, districtCode, subdistrictCode: nextSubdistrict, postalCode });
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${className}`}>
      {/* Province */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">{labels.province || 'จังหวัด'}</label>
        <select
          className="border rounded-xl px-3 py-2 disabled:opacity-60"
          value={provinceCode}
          onChange={handleProvinceChange}
          disabled={disabled}
          required={required}
        >
          <option value="">{placeholders.province || 'เลือกจังหวัด'}</option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>{p.nameTh}</option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">{labels.district || 'อำเภอ/เขต'}</label>
        <select
          className="border rounded-xl px-3 py-2 disabled:opacity-60"
          value={districtCode}
          onChange={handleDistrictChange}
          disabled={disabled || !provinceCode}
          required={required}
        >
          <option value="">{placeholders.district || 'เลือกอำเภอ/เขต'}</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>{d.nameTh}</option>
          ))}
        </select>
      </div>

      {/* Subdistrict */}
      <div className="flex flex-col">
        <label className="text-sm font-medium mb-1">{labels.subdistrict || 'ตำบล/แขวง'}</label>
        <select
          className="border rounded-xl px-3 py-2 disabled:opacity-60"
          value={subdistrictCode}
          onChange={handleSubdistrictChange}
          disabled={disabled || !districtCode}
          required={required}
        >
          <option value="">{placeholders.subdistrict || 'เลือกตำบล/แขวง'}</option>
          {subdistricts.map((s) => (
            <option key={s.code} value={s.code}>{s.nameTh}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressCascader;
