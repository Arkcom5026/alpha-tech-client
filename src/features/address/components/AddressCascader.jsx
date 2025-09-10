
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

import { useEffect, useMemo } from 'react';
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
  provinceFilter,
  autoResolveOnMount = false,
  showProvince = true,
  showDistrict = true,
  showSubdistrict = true,
  hideLabels = true,
  selectClassName = 'text-sm',
}) => {
  const {
    provinces,
    ensureProvincesAction,
    fetchDistrictsAction,
    fetchSubdistrictsAction,
    getDistrictsByProvince,
    getSubdistrictsByDistrict,
    loading,
    resolveBySubdistrictCodeAction,
  } = useAddressStore();

  // Provinces filtered by external predicate (e.g., region)
  const provincesFiltered = useMemo(() => {
    const all = provinces || [];
    if (!provinceFilter) return all;
    try {
      const out = all.filter((p) => provinceFilter(p));
      return out && out.length ? out : all;
    } catch {
      return all;
    }
  }, [provinces, provinceFilter]);

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

  // Auto resolve on mount (optional)
  useEffect(() => {
    if (!autoResolveOnMount) return;
    if (!subdistrictCode) return;
    if (provinceCode && districtCode) return; // already resolved
    (async () => {
      const result = await resolveBySubdistrictCodeAction?.(subdistrictCode);
      if (result) {
        onChange?.({
          provinceCode: result.provinceCode || provinceCode || '',
          districtCode: result.districtCode || districtCode || '',
          subdistrictCode: result.subdistrictCode || subdistrictCode || '',
          postalCode: result.postalCode || '',
        });
      }
    })();
  }, [autoResolveOnMount, subdistrictCode, resolveBySubdistrictCodeAction, onChange, provinceCode, districtCode]);
  // If current province falls outside of filter, reset the cascade
  useEffect(() => {
    if (!provinceCode) return;
    const ok = (provincesFiltered || []).some((p) => String(p.code) === String(provinceCode));
    if (!ok) onChange?.({ provinceCode: '', districtCode: '', subdistrictCode: '', postalCode: '' });
  }, [provinceCode, provincesFiltered]);

  const isLoading = Boolean(loading?.provinces || loading?.districts || loading?.subdistricts || loading?.resolving);
  const loadingProvinces = Boolean(loading?.provinces);
  const loadingDistricts = Boolean(loading?.districts);
  const loadingSubdistricts = Boolean(loading?.subdistricts);

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

  const cols = [showProvince, showDistrict, showSubdistrict].filter(Boolean).length;
  const gridColsClass = cols === 3 ? 'md:grid-cols-3' : cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1';
  return (
    <div className={`grid grid-cols-1 ${gridColsClass} gap-3 ${className}`}>
      {/* Province */}
      <div className={`flex flex-col ${showProvince ? '' : 'hidden'}`}>
        {!hideLabels && (<label className="text-sm font-medium mb-1">{labels.province || 'จังหวัด'}</label>) }
        <select
          className={`border rounded-md px-3 py-2 disabled:opacity-60 ${selectClassName}`}
          aria-label={labels.province || 'จังหวัด'}
          value={provinceCode}
          onChange={handleProvinceChange}
          disabled={disabled || isLoading}
          required={required}
        >
          <option value="">{loadingProvinces ? 'กำลังโหลดจังหวัด...' : (placeholders.province || 'เลือกจังหวัด')}</option>
          {provincesFiltered.map((p) => (
            <option key={p.code} value={p.code}>{p.nameTh}</option>
          ))}
        </select>
      </div>

      {/* District */}
      <div className={`flex flex-col ${showDistrict ? '' : 'hidden'}`}>
        {!hideLabels && (<label className="text-sm font-medium mb-1">{labels.district || 'อำเภอ/เขต'}</label>) }
        <select
          className={`border rounded-md px-3 py-2 disabled:opacity-60 ${selectClassName}`}
          aria-label={labels.district || 'อำเภอ/เขต'}
          value={districtCode}
          onChange={handleDistrictChange}
          disabled={disabled || isLoading || !provinceCode}
          required={required}
        >
          <option value="">{!provinceCode ? (placeholders.district || 'เลือกอำเภอ/เขต') : (loadingDistricts ? 'กำลังโหลดอำเภอ/เขต...' : (placeholders.district || 'เลือกอำเภอ/เขต'))}</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>{d.nameTh}</option>
          ))}
        </select>
      </div>

      {/* Subdistrict */}
      <div className={`flex flex-col ${showSubdistrict ? '' : 'hidden'}`}>
        {!hideLabels && (<label className="text-sm font-medium mb-1">{labels.subdistrict || 'ตำบล/แขวง'}</label>) }
        <select
          className={`border rounded-md px-3 py-2 disabled:opacity-60 ${selectClassName}`}
          aria-label={labels.subdistrict || 'ตำบล/แขวง'}
          value={subdistrictCode}
          onChange={handleSubdistrictChange}
          disabled={disabled || isLoading || !districtCode}
          required={required}
        >
          <option value="">{!districtCode ? (placeholders.subdistrict || 'เลือกตำบล/แขวง') : (loadingSubdistricts ? 'กำลังโหลดตำบล/แขวง...' : (placeholders.subdistrict || 'เลือกตำบล/แขวง'))}</option>
          {subdistricts.map((s) => (
            <option key={s.code} value={s.code}>{s.nameTh}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressCascader;








