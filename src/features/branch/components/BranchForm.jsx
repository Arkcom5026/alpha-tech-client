








import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AddressForm from '@/features/address/components/AddressForm';
import { useAddressStore } from '@/features/address/store/addressStore';

/**
 * BranchForm — เวอร์ชันตัดฟีเจอร์พิกัด/แผนที่ทั้งหมดออก
 * - เหลือเฉพาะ: ชื่อสาขา, เบอร์โทร, ที่อยู่มาตรฐาน (จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์), ภาค (อ่านอย่างเดียว), RBAC toggle, ปุ่มบันทึก
 * - ไม่โหลด/ไม่เรียกใช้ Leaflet, Nominatim, Geolocation, Clipboard parsing ใด ๆ
 */
const BranchForm = ({
  formData,
  setFormData,
  onSubmit,
    submitLabel = 'บันทึก',
}) => {
  // Provinces (มี field region)
  const { provinces, ensureProvincesAction } = useAddressStore();

  // --- Region filter (choose region first, then province list is filtered) ---
  const [regionFilter, setRegionFilter] = useState("");
  // derive region from DOPA code (override for North), fallback to API region field
  const deriveRegion = (pcode, fallback) => {
    const code = Number(pcode);
    const NORTH = new Set([50,51,52,53,54,55,56,57,58,60,61,62,63,64,65,66,67]);
    if (Number.isFinite(code) && NORTH.has(code)) return "เหนือ";
    return fallback || "";
  };
  const regionOptions = useMemo(() => {
    const set = new Set();
    (provinces || []).forEach((p) => set.add(deriveRegion(p.code, p.region)));
    return Array.from(set).filter(Boolean);
  }, [provinces]);

  // Memoized province filter so identity stays stable (prevents unintended resets)
  const provinceFilterFn = useCallback(
    (prov) => !regionFilter || deriveRegion(prov.code, prov.region) === regionFilter,
    [regionFilter]
  );

  // โหลด provinces ไว้ล่วงหน้าเพื่อคำนวณ region
  useEffect(() => { void ensureProvincesAction(); }, [ensureProvincesAction]);

  // Auto-set regionFilter once from current province (useful on Edit page)
  useEffect(() => {
    if (regionFilter) return; // don't override user's selection
    const pcode = formData?.provinceCode ? String(formData.provinceCode) : '';
    if (!pcode) return;
    const prov = Array.isArray(provinces) ? provinces.find((p) => String(p.code) === pcode) : null;
    const computed = deriveRegion(pcode, prov?.region);
    if (computed) setRegionFilter(computed);
  }, [regionFilter, formData?.provinceCode, provinces]);

  // 🔧 Normalizer: แปลงข้อมูลที่โหลดมาจาก BE ให้เป็น *code แบบ string* ให้ตรงกับ AddressForm
  useEffect(() => {
    const getStr = (v) => (v === null || v === undefined ? '' : String(v));
    const updates = {};

    // provinceCode: รองรับ provinceId / province_id / province (name)
    const hasProv = getStr(formData.provinceCode) !== '';
    if (!hasProv) {
      const cand = formData.provinceCode ?? formData.provinceId ?? formData.province_id ?? formData.province;
      let provCode = '';
      if (cand != null && cand !== '') {
        const s = String(cand);
        if (/^[0-9]+$/.test(s)) {
          provCode = s;
        } else if (Array.isArray(provinces) && provinces.length) {
          const prov = provinces.find((p) => p?.name_th === s || p?.nameTH === s || p?.name_en === s || p?.nameEN === s || String(p?.code) === s);
          if (prov) provCode = String(prov.code);
        }
      }
      if (provCode) updates.provinceCode = provCode;
    }

    // districtCode: รองรับ districtId / district_id / district (id/name)
    const hasDist = getStr(formData.districtCode) !== '';
    if (!hasDist) {
      const cand = formData.districtCode ?? formData.districtId ?? formData.district_id ?? formData.district;
      if (cand != null && cand !== '') updates.districtCode = getStr(cand);
    }

    // subdistrictCode: รองรับ subdistrictId / subdistrict_id / subdistrict
    const hasSub = getStr(formData.subdistrictCode) !== '';
    if (!hasSub) {
      const cand = formData.subdistrictCode ?? formData.subdistrictId ?? formData.subdistrict_id ?? formData.subdistrict;
      if (cand != null && cand !== '') updates.subdistrictCode = getStr(cand);
    }

    // postalCode: รองรับ zipcode / post_code / postal_code
    const hasPostal = getStr(formData.postalCode) !== '';
    if (!hasPostal) {
      const cand = formData.postalCode ?? formData.zipcode ?? formData.post_code ?? formData.postal_code;
      if (cand != null && cand !== '') updates.postalCode = getStr(cand);
    }
  // (server ไม่เก็บ region) — ไม่อัปเดต region ใน formData
    if (Object.keys(updates).length) {
      setFormData((prev) => ({ ...prev, ...updates }));
    }
  }, [formData, provinces, setFormData]);

  // รวมค่า address สำหรับ AddressForm
  const addressValue = useMemo(() => ({
    address: formData.address ?? '',
    provinceCode: (formData.provinceCode !== null && formData.provinceCode !== undefined && formData.provinceCode !== '') ? String(formData.provinceCode) : '',
    districtCode: (formData.districtCode !== null && formData.districtCode !== undefined && formData.districtCode !== '') ? String(formData.districtCode) : '',
    subdistrictCode: (formData.subdistrictCode !== null && formData.subdistrictCode !== undefined && formData.subdistrictCode !== '') ? String(formData.subdistrictCode) : '',
    postalCode: (formData.postalCode !== null && formData.postalCode !== undefined && formData.postalCode !== '') ? String(formData.postalCode) : '',
  }), [formData.address, formData.provinceCode, formData.districtCode, formData.subdistrictCode, formData.postalCode]);

  // เมื่อที่อยู่เปลี่ยนจาก AddressForm → อัปเดต formData + คำนวณ region อัตโนมัติ
  const handleAddressChange = (next) => {
    setFormData((prev) => {
      const merged = { ...prev, ...next };
      // 🔒 บังคับ type ให้เป็น string เพื่อให้ตรงกับค่าของ option ใน AddressForm
      if (merged.provinceCode != null && merged.provinceCode !== '') merged.provinceCode = String(merged.provinceCode);
      if (merged.districtCode != null && merged.districtCode !== '') merged.districtCode = String(merged.districtCode);
      if (merged.subdistrictCode != null && merged.subdistrictCode !== '') merged.subdistrictCode = String(merged.subdistrictCode);
      if (merged.postalCode != null && merged.postalCode !== '') merged.postalCode = String(merged.postalCode);
      // (region shown as derived only)
      return merged;
    });
  };

  // ค่าภาค (อ่านอย่างเดียว — คำนวณอัตโนมัติจาก provinceCode)
  // แก้แมปภาคให้ถูกต้อง โดยอิงจากรหัสจังหวัดตามมาตรฐาน DOPA เป็นหลัก
  

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* ชื่อสาขา */}
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อสาขา</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* เบอร์โทร */}
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
        <input
          type="text"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border rounded px-3 py-2"
          placeholder="เช่น 02-123-4567"
        />
      </div>

      {/* ที่อยู่มาตรฐานใหม่ */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">ที่อยู่สาขา</label>
        {/* เลือกภาคก่อนเพื่อกรองรายการจังหวัด */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">กรองจังหวัดตามภาค</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={regionFilter}
              onChange={(e) => {
                const v = e.target.value;
                setRegionFilter(v);
                // reset cascading selections when region changes
                setFormData((prev) => ({
                  ...prev,
                  provinceCode: "",
                  districtCode: "",
                  subdistrictCode: "",
                  postalCode: "",
                }));
              }}
            >
              <option value="">ทุกภาค</option>
              {regionOptions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <AddressForm value={addressValue} onChange={handleAddressChange} required provinceFilter={provinceFilterFn} />
        <p className="text-xs text-gray-500">ระบุที่อยู่/ถนน แล้วเลือก จังหวัด → อำเภอ → ตำบล ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ แต่สามารถแก้ไขได้</p>
      </div>

     { /* RBAC toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rbac-toggle"
          checked={!!formData.RBACEnabled}
          onChange={(e) => setFormData({ ...formData, RBACEnabled: e.target.checked })}
        />
        <label htmlFor="rbac-toggle" className="text-sm">
          เปิดใช้งานระบบ RBAC (สิทธิ์เฉพาะสาขา)
        </label>
      </div>

      {/* ปุ่มบันทึก */}
      <div className="text-right">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 min-w-[160px]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default BranchForm;







