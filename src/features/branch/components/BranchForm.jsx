import React, { useEffect, useMemo, useState, useCallback } from 'react';
import AddressForm from '@/features/address/components/AddressForm';
import { useAddressStore } from '@/features/address/store/addressStore';

/**
 * BranchForm — แบบเรียบง่าย
 * - เหลือ: ชื่อสาขา, เบอร์โทร, ที่อยู่มาตรฐาน (จังหวัด/อำเภอ/ตำบล/รหัสไปรษณีย์), RBAC toggle, ปุ่มบันทึก
 * - ไม่ใช้ optional chaining / nullish coalescing
 * - มีตัวเลือก “ภาค” เพื่อกรองจังหวัด (อ่านอย่างเดียว ไม่บันทึก)
 */
const BranchForm = ({
  formData,
  setFormData,
  onSubmit,
  submitLabel = 'บันทึก',
}) => {
  const { provinces, ensureProvincesAction } = useAddressStore();

  // โหลดรายชื่อจังหวัดล่วงหน้า
  useEffect(() => {
    if (ensureProvincesAction) ensureProvincesAction();
  }, [ensureProvincesAction]);

  // helper: คืนค่าแรกที่ไม่เป็น undefined/null/'' 
  const firstNonNullish = (...args) => {
    for (let i = 0; i < args.length; i++) {
      const v = args[i];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return '';
  };

  // แปลงข้อมูลจาก BE ให้เป็น code (string) ให้ตรงกับ AddressForm
  useEffect(() => {
    const getStr = (v) => (v === null || v === undefined ? '' : String(v));
    const updates = {};

    // provinceCode: รองรับ provinceId / province_id / province (name)
    const hasProv = getStr(formData && formData.provinceCode) !== '';
    if (!hasProv) {
      const cand = firstNonNullish(
        formData && formData.provinceCode,
        formData && formData.provinceId,
        formData && formData.province_id,
        formData && formData.province
      );
      let provCode = '';
      if (cand !== '') {
        const s = String(cand);
        if (/^[0-9]+$/.test(s)) {
          provCode = s;
        } else if (Array.isArray(provinces) && provinces.length) {
          const prov = provinces.find((p) =>
            p && (p.name_th === s || p.nameTH === s || p.name_en === s || p.nameEN === s || String(p.code) === s)
          );
          if (prov) provCode = String(prov.code);
        }
      }
      if (provCode) updates.provinceCode = provCode;
    }

    // districtCode: รองรับ districtId / district_id / district
    const hasDist = getStr(formData && formData.districtCode) !== '';
    if (!hasDist) {
      const candD = firstNonNullish(
        formData && formData.districtCode,
        formData && formData.districtId,
        formData && formData.district_id,
        formData && formData.district
      );
      if (candD !== '') updates.districtCode = getStr(candD);
    }

    // subdistrictCode: รองรับ subdistrictId / subdistrict_id / subdistrict
    const hasSub = getStr(formData && formData.subdistrictCode) !== '';
    if (!hasSub) {
      const candS = firstNonNullish(
        formData && formData.subdistrictCode,
        formData && formData.subdistrictId,
        formData && formData.subdistrict_id,
        formData && formData.subdistrict
      );
      if (candS !== '') updates.subdistrictCode = getStr(candS);
    }

    // postalCode: รองรับ zipcode / post_code / postal_code
    const hasPostal = getStr(formData && formData.postalCode) !== '';
    if (!hasPostal) {
      const candP = firstNonNullish(
        formData && formData.postalCode,
        formData && formData.zipcode,
        formData && formData.post_code,
        formData && formData.postal_code
      );
      if (candP !== '') updates.postalCode = getStr(candP);
    }

    if (Object.keys(updates).length) {
      setFormData((prev) => Object.assign({}, prev, updates));
    }
  }, [formData, provinces, setFormData]);  // ---------------- Region filter (UI only; not saved) ----------------
  const REGION_OPTIONS = [
    { value: '', label: 'ทุกภาค' },
    { value: 'north', label: 'เหนือ' },
    { value: 'northeast', label: 'อีสาน' },
    { value: 'central', label: 'กลาง' },
    { value: 'east', label: 'ตะวันออก' },
    { value: 'west', label: 'ตะวันตก' },
    { value: 'south', label: 'ใต้' },
    { value: 'bkk', label: 'กรุงเทพฯ' },
  ];
  const REGION_SETS = {
    north: new Set(['เชียงใหม่','เชียงราย','แม่ฮ่องสอน','ลำพูน','ลำปาง','แพร่','น่าน','พะเยา','อุตรดิตถ์','ตาก']),
    northeast: new Set(['เลย','หนองบัวลำภู','อุดรธานี','หนองคาย','บึงกาฬ','สกลนคร','นครพนม','มุกดาหาร','ขอนแก่น','กาฬสินธุ์','มหาสารคาม','ร้อยเอ็ด','ชัยภูมิ','ยโสธร','อำนาจเจริญ','ศรีสะเกษ','อุบลราชธานี','สุรินทร์','บุรีรัมย์','นครราชสีมา']),
    central: new Set(['พระนครศรีอยุธยา','อ่างทอง','ลพบุรี','สิงห์บุรี','ชัยนาท','สระบุรี','นนทบุรี','ปทุมธานี','สมุทรปราการ','สมุทรสาคร','สมุทรสงคราม','นครปฐม','สุพรรณบุรี','นครนายก','เพชรบูรณ์']),
    east: new Set(['ฉะเชิงเทรา','ชลบุรี','ระยอง','จันทบุรี','ตราด','ปราจีนบุรี','สระแก้ว']),
    west: new Set(['กาญจนบุรี','ราชบุรี','เพชรบุรี','ประจวบคีรีขันธ์']),
    south: new Set(['ชุมพร','สุราษฎร์ธานี','นครศรีธรรมราช','กระบี่','พังงา','ภูเก็ต','ระนอง','ตรัง','พัทลุง','สงขลา','สตูล','ปัตตานี','ยะลา','นราธิวาส']),
    bkk: new Set(['กรุงเทพมหานคร']),
  };
  const [regionFilter, setRegionFilter] = useState('');
  const provinceFilterFn = useCallback(function (p) {
    if (!regionFilter) return true; // ทุกภาค
    if (!p) return false;
    const name = String(p.nameTh || p.name_th || p.name || '').trim();
    const setObj = REGION_SETS[regionFilter];
    if (!setObj) return true;
    return setObj.has(name);
  }, [regionFilter]);

  // รวมค่า address สำหรับ AddressForm
  const addressValue = useMemo(
    () => ({
      address:
        formData && formData.address !== undefined && formData.address !== null
          ? formData.address
          : '',
      provinceCode:
        formData && formData.provinceCode != null && formData.provinceCode !== ''
          ? String(formData.provinceCode)
          : '',
      districtCode:
        formData && formData.districtCode != null && formData.districtCode !== ''
          ? String(formData.districtCode)
          : '',
      subdistrictCode:
        formData && formData.subdistrictCode != null && formData.subdistrictCode !== ''
          ? String(formData.subdistrictCode)
          : '',
      postalCode:
        formData && formData.postalCode != null && formData.postalCode !== ''
          ? String(formData.postalCode)
          : '',
    }),
    [
      formData && formData.address,
      formData && formData.provinceCode,
      formData && formData.districtCode,
      formData && formData.subdistrictCode,
      formData && formData.postalCode,
    ]
  );

  // เมื่อที่อยู่เปลี่ยน → อัปเดต formData
  const handleAddressChange = (next) => {
    setFormData((prev) => {
      const merged = Object.assign({}, prev, next);
      if (merged.provinceCode != null && merged.provinceCode !== '') merged.provinceCode = String(merged.provinceCode);
      if (merged.districtCode != null && merged.districtCode !== '') merged.districtCode = String(merged.districtCode);
      if (merged.subdistrictCode != null && merged.subdistrictCode !== '') merged.subdistrictCode = String(merged.subdistrictCode);
      if (merged.postalCode != null && merged.postalCode !== '') merged.postalCode = String(merged.postalCode);
      return merged;
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* ชื่อสาขา */}
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อสาขา</label>
        <input
          type="text"
          value={(formData && formData.name) || ''}
          onChange={(e) => setFormData(Object.assign({}, formData, { name: e.target.value }))}
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* เบอร์โทร */}
      <div>
        <label className="block text-sm font-medium mb-1">เบอร์โทร</label>
        <input
          type="text"
          value={(formData && formData.phone) || ''}
          onChange={(e) => setFormData(Object.assign({}, formData, { phone: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="เช่น 02-123-4567"
        />
      </div>

      {/* ที่อยู่มาตรฐานใหม่ */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">ที่อยู่สาขา</label>        {/* ภาค (ใช้กรองจังหวัดเท่านั้น — อ่านอย่างเดียว ไม่บันทึก) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3 sm:col-span-1">
            <label className="block text-sm font-medium mb-1">ภาค</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              {REGION_OPTIONS.map(function (opt) {
                return (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">ใช้กรองจังหวัดเท่านั้น — <span className="font-medium">อ่านอย่างเดียว (ไม่บันทึก)</span></p>
          </div>
        </div>

        {/* Address cascader */}
        <AddressForm value={addressValue} onChange={handleAddressChange} required provinceFilter={provinceFilterFn} />
        <p className="text-xs text-gray-500">
          ระบุที่อยู่/ถนน แล้วเลือก จังหวัด → อำเภอ → ตำบล ระบบจะเติมรหัสไปรษณีย์ให้อัตโนมัติ แต่สามารถแก้ไขได้
        </p>
      </div>

      {/* RBAC toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rbac-toggle"
          checked={!!(formData && formData.RBACEnabled)}
          onChange={(e) => setFormData(Object.assign({}, formData, { RBACEnabled: e.target.checked }))}
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


